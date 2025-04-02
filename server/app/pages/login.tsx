import { apiEndpointTitle, config, title } from '../../config.js'
import { Link, Redirect } from '../components/router.js'
import {
  Context,
  DynamicContext,
  ExpressContext,
  getContextFormBody,
  getStringCasual,
} from '../context.js'
import { o } from '../jsx/jsx.js'
import { Routes, StaticPageRoute } from '../routes.js'
import { renderError } from '../components/error.js'
import { proxy } from '../../../db/proxy.js'
import { find } from 'better-sqlite3-proxy'
import { comparePassword } from '../../hash.js'
import { UserMessageInGuestView } from './profile.js'
import { getAuthUserId, writeUserIdToCookie } from '../auth/user.js'
import Style from '../components/style.js'
import { wsStatus } from '../components/ws-status.js'
import { to_full_hk_mobile_phone } from '@beenotung/tslib/validate.js'
import { oauthProviderList } from '../components/oauth.js'
import { Field } from '../components/field.js'
import { is_ionic, is_web, Page } from '../components/page.js'
import { loadClientPlugin } from '../../client-plugin.js'
import { IonButton } from '../components/ion-button.js'

let style = Style(/* css */ `
#login .field {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
`)

let sweetAlertPlugin = loadClientPlugin({
  entryFile: 'dist/client/sweetalert.js',
})

let LoginPage = (
  <>
    {style}
    <Page
      id="login"
      title="Login"
      backHref="/"
      backText="Home"
      backColor="light"
      headerColor="primary"
    >
      <p>Welcome back to {config.short_site_name}!</p>
      <Main />
      {sweetAlertPlugin.node}
      {is_ionic && wsStatus.safeArea}
    </Page>
  </>
)

function Main(_attrs: {}, context: Context) {
  let user_id = getAuthUserId(context)
  return user_id ? <UserMessageInGuestView user_id={user_id} /> : guestView
}

let verifyFormBody = (
  <>
    {config.enable_email && (
      <Field
        label="Email"
        type="email"
        name="email"
        msgId="emailMsg"
        autocomplete="email"
        required
        onchange={
          config.enable_sms
            ? 'event.target.form.tel.required = !this.value'
            : undefined
        }
      />
    )}
    {config.enable_email &&
      config.enable_sms &&
      (is_web ? (
        <div style="margin: 0.5rem 0">or</div>
      ) : (
        <div style="margin-inline-start: 1rem; margin-top: 1rem">or</div>
      ))}
    {config.enable_sms && (
      <Field
        label="Phone number"
        type="tel"
        name="tel"
        msgId="telMsg"
        autocomplete="tel"
        required
        onchange={
          config.enable_email
            ? 'event.target.form.email.required = !this.value'
            : undefined
        }
      />
    )}
    {is_web ? (
      <div class="field">
        <label>
          <input type="checkbox" name="include_link" /> Include magic link (more
          convince but may be treated as spam)
        </label>
      </div>
    ) : (
      <>
        <ion-item>
          <ion-checkbox slot="start" name="include_link"></ion-checkbox>
          <ion-label style="pointer-events: none">Include magic link</ion-label>
        </ion-item>
        <ion-note color="dark">
          (More convince but may be treated as spam)
        </ion-note>
      </>
    )}
    {is_web ? (
      <input type="submit" value="Verify" />
    ) : (
      <ion-button
        type="submit"
        class="ion-margin"
        fill="block"
        color="tertiary"
      >
        Verify
      </ion-button>
    )}
  </>
)

let passwordFormBody = (
  <>
    <Field
      label="Username, email or phone number"
      name="loginId"
      msgId="loginIdMsg"
      autocomplete="username"
      required
    />
    <Field
      label="Password"
      name="password"
      msgId="passwordMsg"
      type="password"
      autocomplete="current-password"
      required
    />
    {is_web ? (
      <div class="input-container">
        <input type="submit" value="Login" />
      </div>
    ) : (
      <div class="ion-text-center ion-margin">
        <ion-button type="submit" fill="block" color="primary">
          Login
        </ion-button>
      </div>
    )}
    <Message />
  </>
)

let guestView = (
  <>
    {config.use_social_login && (
      <>
        <div class="separator-line flex-center">Login with social network</div>
        <div class="flex-center flex-column">{oauthProviderList}</div>
      </>
    )}
    {(config.enable_email || config.enable_sms) && (
      <>
        <div class="separator-line flex-center">
          Login with verification code
        </div>
        <form method="POST" action="/verify/submit" onsubmit="emitForm(event)">
          {verifyFormBody}
        </form>
      </>
    )}
    <div class="separator-line flex-center">Login with password</div>
    <form method="post" action="/login/submit">
      {passwordFormBody}
    </form>
    <div class="separator-line flex-center">
      New to {config.short_site_name}?
    </div>
    <div style="margin-bottom: 1rem">
      {is_web ? (
        <Link href="/register">Create an account</Link>
      ) : (
        <IonButton
          url="/register"
          expand="block"
          class="ion-margin"
          color="secondary"
        >
          Create an account
        </IonButton>
      )}
    </div>
  </>
)

let codes: Record<string, string> = {
  not_found: 'user not found',
  no_pw: config.use_social_login
    ? 'password is not set, did you use email/sms verification or social login?'
    : 'password is not set, did you use email/sms verification?',
  wrong_email: 'wrong email or password',
  wrong_id: 'wrong username, phone number or password',
  ok: 'login successfully',
}

function Message(_attrs: {}, context: DynamicContext) {
  let code = new URLSearchParams(context.url.split('?').pop()).get('code')
  if (!code) return null
  return <p class="error">{codes[code] || code}</p>
}

function findUser(loginId: string) {
  if (loginId.includes('@')) {
    return find(proxy.user, { email: loginId })
  }
  let tel = to_full_hk_mobile_phone(loginId)
  return (
    (tel ? find(proxy.user, { tel }) : null) ||
    find(proxy.user, { username: loginId })
  )
}

async function submit(context: ExpressContext) {
  try {
    let body = getContextFormBody(context) || {}
    let loginId = getStringCasual(body, 'loginId')
    let password = getStringCasual(body, 'password')
    let user = findUser(loginId)

    if (!user || !user.id) {
      return <Redirect href="/login?code=not_found" />
    }

    let password_hash = user.password_hash
    if (!password_hash) {
      return <Redirect href="/login?code=no_pw" />
    }

    let matched = await comparePassword({
      password,
      password_hash,
    })

    if (!matched) {
      return loginId.includes('@') ? (
        <Redirect href="/login?code=wrong_email" />
      ) : (
        <Redirect href="/login?code=wrong_id" />
      )
    }

    writeUserIdToCookie(context.res, user.id)

    return <Redirect href="/login?code=ok" />
  } catch (error) {
    return (
      <div>
        {renderError(error, context)}
        <Link href="/login">Try again</Link>
      </div>
    )
  }
}

let routes = {
  '/login': {
    title: title('Login'),
    description: `Login to access exclusive content and functionality. Welcome back to our community on ${config.short_site_name}.`,
    menuText: 'Login',
    menuUrl: '/login',
    guestOnly: true,
    node: LoginPage,
  },
  '/login/submit': {
    streaming: false,
    async resolve(context: Context): Promise<StaticPageRoute> {
      return {
        title: apiEndpointTitle,
        description: `login existing account`,
        node: await submit(context as ExpressContext),
      }
    },
  },
} satisfies Routes

export default { routes }
