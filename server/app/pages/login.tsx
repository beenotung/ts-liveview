import { LayoutType, apiEndpointTitle, config, title } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
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

function Main(_attrs: {}, context: Context) {
  let user_id = getAuthUserId(context)
  return user_id ? <UserMessageInGuestView user_id={user_id} /> : guestView
}

let verifyFormBody = (
  <>
    <div class="field">
      <label>
        Email or phone number
        <div class="input-container">
          <input
            name="email"
            type="email"
            autocomplete="email"
            placeholder="Email"
            required
            onchange="this.form.tel.required = !this.value"
          />
          <div>or</div>
          <input
            name="tel"
            type="tel"
            autocomplete="tel"
            placeholder="Phone number"
            required
            onchange="this.form.email.required = !this.value"
          />
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
)

let passwordFormBody = (
  <>
    <label>
      Username, email or phone number
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
)

let guestView = (
  <>
    <div>Login with:</div>
    <form
      id="verifyForm"
      method="POST"
      action="/verify/submit"
      onsubmit="emitForm(event)"
    >
      {verifyFormBody}
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
