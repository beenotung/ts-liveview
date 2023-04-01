import { apiEndpointTitle, config, title } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
import { Link, Redirect } from '../components/router.js'
import { Context, DynamicContext, ExpressContext } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Routes, StaticPageRoute } from '../routes.js'
import { getContextFormBody } from '../context.js'
import { renderError } from '../components/error.js'
import { proxy } from '../../../db/proxy.js'
import { find } from 'better-sqlite3-proxy'
import { getStringCasual } from '../helpers.js'
import { comparePassword } from '../../hash.js'
import { decodeJwt, encodeJwt } from '../jwt.js'
import { getContextCookie } from '../cookie.js'
import { renderUserMessageInGuestView } from './profile.js'

let LoginPage = (
  <div id="login">
    <h2>Login to {config.short_site_name}</h2>
    <p>{commonTemplatePageText}</p>
    <Main />
  </div>
)

function Main(_attrs: {}, context: Context) {
  let token = getContextCookie(context)?.token
  return token ? renderUserMessageInGuestView(token) : guestView
}

let guestView = (
  <>
    <form method="post" action="/login/submit">
      <label>
        Username or email address
        <div class="input-container">
          <input name="loginId" />
        </div>
      </label>
      <label>
        Password
        <div class="input-container">
          <input name="password" type="password" />
        </div>
      </label>
      <div class="input-container">
        <input type="submit" value="Login" />
      </div>
      <Message />
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

    let user_id = user.id

    let token = encodeJwt({ id: user_id })

    context.res.cookie('token', token, {
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
    })

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

let routes: Routes = {
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
}

export default { routes }
