import { array, object, string } from 'cast.ts'
import { config } from '../../config.js'
import { commonTemplatePageDesc } from '../components/common-template.js'
import { Link, Redirect, Switch } from '../components/router.js'
import Style from '../components/style.js'
import { Context, getContextFormBody, WsContext } from '../context.js'
import { EarlyTerminate } from '../helpers.js'
import { o } from '../jsx/jsx.js'
import { find } from 'better-sqlite3-proxy'
import {
  appleLogo,
  facebookLogo,
  githubLogo,
  googleLogo,
  instagramLogo,
} from '../svgs/logo.js'
import { proxy } from '../../../db/proxy.js'

let style = Style(/* css */ `
.or-line::before,
.or-line::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #888;
  margin: 1rem 0.75rem;
}
.oauth-provider-list a {
  display: inline-flex;
  align-items: center;
  border: 1px solid #888;
  padding: 0.25rem;
  border-radius: 0.25rem;
  margin: 0.25rem;
}
#sign-up form p {
  color: darkred;
}
`)

let SignUpPage = (
  <div id="sign-up">
    {style}
    <h2>Sign up</h2>
    {commonTemplatePageDesc}
    <p>
      Welcome to {config.short_site_name}!
      <br />
      Let's begin the adventure~
    </p>
    <p>
      Already have an account? <Link href="/login">Sign in</Link>
    </p>
    <div class="flex-center flex-column">
      <div>Register with:</div>
      <div class="oauth-provider-list">
        <a>{googleLogo}&nbsp;Google</a>
        <a>{appleLogo}&nbsp;Apple</a>
        <a>{githubLogo}&nbsp;GitHub</a>
        <a>{facebookLogo}&nbsp;Facebook</a>
        <a>{instagramLogo}&nbsp;Instagram</a>
      </div>
    </div>
    <div class="or-line flex-center">or</div>
    <SignUpForm />
  </div>
)

function SignUpForm() {
  return (
    <form onsubmit="emitForm(this)" action="/register/submit" method="POST">
      <label>
        Username
        <div class="input-container">
          <input
            name="username"
            oninput="emit('/register/check-username', this.value)"
          />
        </div>
        <p id="usernameMsg"></p>
      </label>
      <label>
        Email
        <div class="input-container">
          <input name="email" type="email" />
        </div>
      </label>
      <p>This email is invalid</p>
      <p>This email is already taken</p>
      <label>
        Password
        <div className="input-container">
          <input name="password" type="password" />
        </div>
      </label>
      <p>Password is too short</p>
      <p>Password may be compromised</p>
      <p>Password is strong</p>
      <label>
        Confirm password
        <div className="input-container">
          <input name="confirm_password" type="password" />
        </div>
      </label>
      <p>Password not matched</p>
      <input type="submit" value="Submit" />
    </form>
  )
}

let formParser = object({
  username: string(),
  password: string(),
})
function Submit(_attrs: {}, context: Context) {
  let body = getContextFormBody(context)
  console.log({ body })
  let input = formParser.parse(body)
  console.log({ input })
  return (
    <div>
      todo
      <Redirect href="/register"></Redirect>
    </div>
  )
}

let minUsername = 1
let maxUsername = 32

function CheckUsername(_: {}, context: WsContext) {
  console.log('check username', context.args)
  let username = context.args?.[0]
  if (typeof username !== 'string' || username.length === 0) {
    context.ws.send(['batch', [['update-text', '#usernameMsg', ``]]])
    throw EarlyTerminate
  }
  if (username.length < minUsername) {
    context.ws.send([
      'batch',
      [
        [
          'update-text',
          '#usernameMsg',
          `username "${username}" is too short, need ${
            minUsername - username.length
          } more characters`,
        ],
        ['update-attrs', '#usernameMsg', { style: 'color:red' }],
      ],
    ])
    throw EarlyTerminate
  }
  if (username.length > maxUsername) {
    context.ws.send([
      'batch',
      [
        [
          'update-text',
          '#usernameMsg',
          `username "${username}" is too long, need ${
            username.length - maxUsername
          } less characters`,
        ],
        ['update-attrs', '#usernameMsg', { style: 'color:red' }],
      ],
    ])
    throw EarlyTerminate
  }
  let excludedChars = Array.from(
    new Set(username.replace(/[a-z0-9]/g, '')),
  ).join('')
  if (excludedChars.length > 0) {
    context.ws.send([
      'batch',
      [
        [
          'update-text',
          '#usernameMsg',
          `username should only consist of english letters [a-z] and digits [0-9], hyphen [-] and underscore [_] are also allowed.`,
        ],
        ['update-attrs', '#usernameMsg', { style: 'color:#a00' }],
        [
          'append',
          '#usernameMsg',
          [
            'p',
            { style: 'color:red' },
            [`But ${JSON.stringify(excludedChars)} could not be used.`],
          ],
        ],
      ],
    ])
    throw EarlyTerminate
  }
  if (find(proxy.user, { username })) {
    context.ws.send([
      'batch',
      [
        [
          'update-text',
          '#usernameMsg',
          `username "${username}" is already used`,
        ],
        ['update-attrs', '#usernameMsg', { style: 'color:red' }],
      ],
    ])
    throw EarlyTerminate
  }
  context.ws.send([
    'batch',
    [
      ['update-text', '#usernameMsg', `username "${username}" is available`],
      ['update-attrs', '#usernameMsg', { style: 'color:green' }],
    ],
  ])

  throw EarlyTerminate
}

export default Switch({
  '/register': SignUpPage,
  '/register/check-username': <CheckUsername />,
  '/register/submit': <Submit />,
})
