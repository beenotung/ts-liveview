import { LayoutType, apiEndpointTitle, config, title } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
import { Link, Redirect } from '../components/router.js'
import { Context, DynamicContext, ExpressContext } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Routes, StaticPageRoute } from '../routes.js'
import { getContextFormBody, getStringCasual } from '../context.js'
import { renderError } from '../components/error.js'
import { proxy } from '../../../db/proxy.js'
import { find } from 'better-sqlite3-proxy'
import { comparePassword } from '../../hash.js'
import { UserMessageInGuestView } from './profile.js'
import { getAuthUserId, writeUserIdToCookie } from '../auth/user.js'
import Style from '../components/style.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { wsStatus } from '../components/ws-status.js'

let style = Style(/* css */ `
#login .field {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
`)

let LoginPage = (
  <div id="login">
    {style}
    <h1>Login to {config.short_site_name}</h1>
    <p>{commonTemplatePageText}</p>
    <Main />
  </div>
)
if (config.layout_type === LayoutType.ionic) {
  LoginPage = (
    <>
      {style}
      <ion-header>
        <ion-toolbar color="primary">
          <IonBackButton href="/" backText="Home" color="light" />
          <ion-title>Login</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div id="login">
          <h1>Welcome back to {config.short_site_name}</h1>
          <p>{commonTemplatePageText}</p>
          <Main />
        </div>
        {wsStatus.safeArea}
      </ion-content>
    </>
  )
}

function Main(_attrs: {}, context: Context) {
  let user_id = getAuthUserId(context)
  return user_id ? <UserMessageInGuestView user_id={user_id} /> : guestView
}

let emailFormBody =
  config.layout_type !== LayoutType.ionic ? (
    <>
      <div class="field">
        <label>
          Email
          <div class="input-container">
            <input name="email" type="email" autocomplete="email" />
          </div>
        </label>
      </div>
      <div class="field">
        <label>
          <input type="checkbox" name="include_link" /> Include magic link (more
          convince but may be treated as spam)
        </label>
      </div>
      <input type="submit" value="Verify" />
    </>
  ) : (
    <>
      <ion-list>
        <ion-item>
          <ion-input
            label="Email"
            label-placement="floating"
            type="email"
            name="email"
            autocomplete="email"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-checkbox name="include_link" slot="start"></ion-checkbox>
          <ion-label>Include magic link</ion-label>
        </ion-item>
        <ion-note color="dark">
          <div class="ion-padding-horizontal">
            (More convince but may be treated as spam)
          </div>
        </ion-note>
      </ion-list>
      <div class="ion-text-center ion-margin">
        <ion-button type="submit" fill="block" color="tertiary">
          Verify
        </ion-button>
      </div>
    </>
  )

let passwordFormBody =
  config.layout_type !== LayoutType.ionic ? (
    <>
      <label>
        Username or email address
        <div class="input-container">
          <input name="loginId" autocomplete="username" />
        </div>
      </label>
      <label>
        Password
        <div class="input-container">
          <input
            name="password"
            type="password"
            autocomplete="current-password"
          />
        </div>
      </label>
      <div class="input-container">
        <input type="submit" value="Login" />
      </div>
      <Message />
    </>
  ) : (
    <>
      <ion-list>
        <ion-item>
          <ion-input
            label="Username or email address"
            label-placement="floating"
            name="loginId"
            autocomplete="username"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            label="Password"
            label-placement="floating"
            name="password"
            type="password"
            autocomplete="current-password"
          ></ion-input>
        </ion-item>
      </ion-list>
      <div class="ion-text-center ion-margin">
        <ion-button type="submit" fill="block" color="primary">
          Login
        </ion-button>
      </div>
      <Message />
    </>
  )

let guestView = (
  <>
    <div>Login with:</div>
    <form
      method="POST"
      action="/verify/email/submit"
      onsubmit="emitForm(event)"
    >
      {emailFormBody}
    </form>
    <div class="or-line flex-center">or</div>
    <form method="post" action="/login/submit">
      {passwordFormBody}
    </form>
    <div>
      New to {config.short_site_name}?{' '}
      <Link href="/register">Create an account</Link>.
    </div>
  </>
)

let codes: Record<string, string> = {
  not_found: 'user not found',
  no_pw: 'password is not set, did you use social login?',
  wrong: 'wrong username, email or password',
  ok: 'login successfully',
}

function Message(_attrs: {}, context: DynamicContext) {
  let code = new URLSearchParams(context.url.split('?').pop()).get('code')
  if (!code) return null
  return <p class="error">{codes[code] || code}</p>
}

async function submit(context: ExpressContext) {
  try {
    let body = getContextFormBody(context) || {}
    let loginId = getStringCasual(body, 'loginId')
    let password = getStringCasual(body, 'password')
    let user = find(
      proxy.user,
      loginId.includes('@') ? { email: loginId } : { username: loginId },
    )
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
      return <Redirect href="/login?code=wrong" />
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
