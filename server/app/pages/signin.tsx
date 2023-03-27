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

let SignInPage = (
  <div id="sign-in">
    <h2>Sign in to {config.short_site_name}</h2>
    <p>{commonTemplatePageText}</p>
    <form method="post" action="/signin/submit" onsubmit="emitForm(event)">
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
        <input type="submit" value="Sign in" />
      </div>
    </form>
    <div>
      New to {config.short_site_name}?{' '}
      <Link href="/signup">Create an account</Link>.
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
          <Link href="/signin">Try again</Link>
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
          <Link href="/signin">Try again</Link>
        </div>
      )
    }

    let user_id = user.id

    return (
      <div>
        <p>Signin successfully.</p>
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
        <Link href="/signin">Try again</Link>
      </div>
    )
  }
}

let routes: Record<string, PageRoute> = {
  '/signin': {
    title: title('Sign In'),
    description: `Sign in to access exclusive content and functionality. Welcome back to our community on ${config.short_site_name}.`,
    menuText: 'Sign In',
    menuUrl: '/signin',
    node: SignInPage,
  },
  '/signin/submit': {
    async resolve(context): Promise<StaticPageRoute> {
      return {
        title: apiEndpointTitle,
        description: `signin existing account`,
        node: await submit(context),
      }
    },
  },
}

export default { routes }
