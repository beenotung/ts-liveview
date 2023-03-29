import { apiEndpointTitle, config, title } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
import { Link } from '../components/router.js'
import { Context } from '../context.js'
import { o } from '../jsx/jsx.js'
import { PageRoute, StaticPageRoute } from '../routes.js'
import { getContextFormBody } from '../context.js'
import { renderError } from '../components/error.js'
import { proxy } from '../../../db/proxy.js'
import { find } from 'better-sqlite3-proxy'
import { getStringCasual } from '../helpers.js'
import { comparePassword } from '../../hash.js'

let LoginPage = (
  <div id="login">
    <h2>Login to {config.short_site_name}</h2>
    <p>{commonTemplatePageText}</p>
    <form method="post" action="/login/submit" onsubmit="emitForm(event)">
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
    </form>
    <div>
      New to {config.short_site_name}?{' '}
      <Link href="/register">Create an account</Link>.
    </div>
  </div>
)

async function submit(context: Context) {
  try {
    let body = getContextFormBody(context) || {}
    let loginId = getStringCasual(body, 'loginId')
    let password = getStringCasual(body, 'password')
    let user = find(
      proxy.user,
      loginId.includes('@') ? { email: loginId } : { username: loginId },
    )
    if (!user) {
      return (
        <div>
          {renderError('user not found', context)}
          <Link href="/login">Try again</Link>
        </div>
      )
    }

    let matched = await comparePassword({
      password,
      password_hash: user.password_hash,
    })

    if (!matched) {
      return (
        <div>
          {renderError('wrong username, email or password', context)}
          <Link href="/login">Try again</Link>
        </div>
      )
    }

    let user_id = user.id

    return (
      <div>
        <p>Login successfully.</p>
        <p>Your user id is #{user_id}.</p>
        <p>
          Back to <Link href="/">home page</Link>
        </p>
      </div>
    )
  } catch (error) {
    return (
      <div>
        {renderError(error, context)}
        <Link href="/login">Try again</Link>
      </div>
    )
  }
}

let routes: Record<string, PageRoute> = {
  '/login': {
    title: title('Login'),
    description: `Login to access exclusive content and functionality. Welcome back to our community on ${config.short_site_name}.`,
    menuText: 'Login',
    menuUrl: '/login',
    node: LoginPage,
  },
  '/login/submit': {
    async resolve(context): Promise<StaticPageRoute> {
      return {
        title: apiEndpointTitle,
        description: `login existing account`,
        node: await submit(context),
      }
    },
  },
}

export default { routes }
