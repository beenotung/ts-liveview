import { apiEndpointTitle, config, title } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
import { Link } from '../components/router.js'
import Style from '../components/style.js'
import { Context, getContextFormBody, WsContext } from '../context.js'
import { EarlyTerminate, getStringCasual } from '../helpers.js'
import { o } from '../jsx/jsx.js'
import { find } from 'better-sqlite3-proxy'
import {
  appleLogo,
  facebookLogo,
  githubLogo,
  googleLogo,
  instagramLogo,
} from '../svgs/logo.js'
import { proxy, User } from '../../../db/proxy.js'
import { ServerMessage } from '../../../client/types.js'
import { is_email } from '@beenotung/tslib'
import { Raw } from '../components/raw.js'
import { hashPassword } from '../../hash.js'
import { Routes, StaticPageRoute } from '../routes.js'
import { Node } from '../jsx/types.js'
import { renderError } from '../components/error.js'
import { getContextCookie, getWsCookie } from '../cookie.js'
import { renderUserMessageInGuestView } from './profile.js'
import { encodeJwt } from '../jwt.js'

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
#register form .field {
  display: flex;
  flex-wrap: wrap;
}
#register form .field input {
  margin: 0.25rem 0;
}
#register form .field .space {
  width: 4rem;
}
#register form .field .msg {
  align-self: end;
  margin-bottom: 0.25rem;
}
#register form .field .extra {
  color: darkred;
  display: block;
  margin-top: 0.25rem;
}
#register .hint {
  border-inline-start: 3px solid #748;
  background-color: #edf;
  padding: 1rem;
  margin: 0.5rem 0;
  width: fit-content;
}
`)

let RegisterPage = (
  <div id="register">
    {style}
    <h2>Register on {config.short_site_name}</h2>
    <p>{commonTemplatePageText}</p>
    <p>
      Welcome to {config.short_site_name}!
      <br />
      Let's begin the adventure~
    </p>
    <Main />
  </div>
)

function Main(_attrs: {}, context: Context) {
  let token = getContextCookie(context)?.token
  return token ? renderUserMessageInGuestView(token) : guestView
}

let guestView = (
  <>
    <p>
      Already have an account? <Link href="/login">Login</Link>
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
    <form onsubmit="emitForm(event)" action="/register/submit" method="POST">
      <Field
        label="Username"
        name="username"
        msgId="usernameMsg"
        oninput="emit('/register/check-username', this.value)"
      />
      <Field
        label="Email (optional)"
        type="email"
        name="email"
        msgId="emailMsg"
        oninput="emit('/register/check-email', this.value)"
      />
      <Field
        label="Password"
        type="password"
        name="password"
        msgId="passwordMsg"
        oninput="emit('/register/check-password', this.value);this.form.confirm_password.value=''"
      />

      <Field
        label="Confirm password"
        type="password"
        name="confirm_password"
        msgId="confirmPasswordMsg"
        oninput="checkPassword(this.form)"
      />
      {Raw(/* html */ `<script>
function checkPassword (form) {
  let c = form.confirm_password.value
  if (c.length == 0) {
    confirmPasswordMsg.textContent = ''
    return
  }
  let p = form.password.value
  if (p != c) {
    confirmPasswordMsg.textContent = 'password not matched'
    confirmPasswordMsg.style.color = 'red'
    return
  }
  confirmPasswordMsg.textContent = 'password matched'
  confirmPasswordMsg.style.color = 'green'
}
</script>`)}
      <input type="submit" value="Submit" />
      <ClearInputContext />
    </form>
    <div class="hint">
      Your password is not be stored in plain text.
      <br />
      Instead, it is processed with{' '}
      <a href="https://en.wikipedia.org/wiki/Bcrypt">bcrypt algorithm</a> to
      protect your credential against data leak.
    </div>
  </>
)

function Field(
  attrs: {
    label: string
    type?: string
    name: string
    oninput: string
    msgId: string
  },
  context: InputContext,
) {
  let value = context.values?.[attrs.name]
  let validateResult = context.contextError?.[attrs.msgId]
  return (
    <div class="field">
      <label>
        {attrs.label}
        <div>
          <input
            type={attrs.type}
            name={attrs.name}
            oninput={attrs.oninput}
            value={value}
          />
        </div>
      </label>
      <div class="space"></div>
      {renderErrorMessage(attrs.msgId, validateResult)}
    </div>
  )
}

function renderErrorMessage(id: string, result: ValidateResult | undefined) {
  if (!result) {
    return <div id={id} class="msg"></div>
  }

  return (
    <div
      id={id}
      class="msg"
      style={result.type == 'ok' ? 'color:green' : 'color:red'}
    >
      {result.text}
      {result.extra && <span class="extra">{result.extra}</span>}
    </div>
  )
}

function ClearInputContext(_attrs: {}, context: InputContext) {
  context.contextError = undefined
  context.values = undefined
}

type InputContext = Context & {
  contextError?: ContextError
  values?: Record<string, string>
}
type ContextError = Record<string, ValidateResult>

type ValidateResult =
  | { type: 'error'; text: string; extra?: string }
  | {
      type: 'found'
      text: string
      user: User
      extra?: string
    }
  | { type: 'ok'; text: string; extra?: string }

let minUsername = 1
let maxUsername = 32

function validateUsername(username: string): ValidateResult {
  if (!username) {
    return { type: 'error', text: 'username not provided' }
  }

  if (username.length < minUsername) {
    let diff = minUsername - username.length
    return {
      type: 'error' as const,
      text: `username "${username}" is too short, need ${diff} more characters`,
    }
  }

  if (username.length > maxUsername) {
    let diff = username.length - maxUsername
    return {
      type: 'error' as const,
      text: `username "${username}" is too long, need ${diff} less characters`,
    }
  }

  if (username.replace(/badminton/g, '').includes('admin')) {
    return {
      type: 'error' as const,
      text: `username cannot contains "admin"`,
    }
  }

  let excludedChars = Array.from(
    new Set(username.replace(/[a-z0-9_]/g, '')),
  ).join('')
  if (excludedChars.length > 0) {
    return {
      type: 'error' as const,
      text: `username cannot contains "${excludedChars}"`,
      extra: `username should only consist of english letters [a-z] and digits [0-9], underscore [_] is also allowed`,
    }
  }

  let user = find(proxy.user, { username })
  if (user) {
    return {
      type: 'found' as const,
      text: `username "${username}" is already used`,
      user,
    }
  }

  return {
    type: 'ok' as const,
    text: `username "${username}" is available`,
  }
}

let minPassword = 6
let maxPassword = 256

function validatePassword(password: string): ValidateResult {
  if (!password) {
    return { type: 'error', text: 'password not provided' }
  }

  if (password.length < minPassword) {
    let diff = minPassword - password.length
    return {
      type: 'error' as const,
      text: `the password is too short, need ${diff} more characters`,
    }
  }

  if (password.length > maxPassword) {
    let diff = password.length - maxPassword
    return {
      type: 'error' as const,
      text: `the password is too long, need ${diff} less characters`,
    }
  }
  return { type: 'ok' as const, text: 'password is acceptable' }
}

// email is optional
function validateEmail(email: string): ValidateResult {
  if (!email) {
    return { type: 'ok', text: '' }
  }

  if (!is_email(email)) {
    return {
      type: 'error',
      text: 'invalid email, the format should be "user@example.net"',
    }
  }

  let user = find(proxy.user, { email })
  if (user) {
    return {
      type: 'found' as const,
      text: `email "${email}" is already used`,
      user,
    }
  }

  return { type: 'ok', text: `email "${email}" is valid` }
}

function validateConfirmPassword(input: {
  password: string
  confirm_password: string
}): ValidateResult {
  if (!input.password)
    return {
      type: 'error',
      text: 'Password not provided',
    }
  if (input.password != input.confirm_password)
    return {
      type: 'error',
      text: 'Password not matched',
    }
  return {
    type: 'ok',
    text: 'Password matched',
  }
}

function validateInput(input: {
  context: WsContext
  field: string
  value: string | void
  selector: string
  validate: (value: string) => ValidateResult
}) {
  let { context, value, selector } = input

  if (typeof value !== 'string' || value.length == 0) {
    context.ws.send(['update-text', selector, ``])
    throw EarlyTerminate
  }

  let result = input.validate(value)

  if (result.type == 'ok') {
    context.ws.send([
      'batch',
      [
        ['update-text', selector, result.text],
        ['update-attrs', selector, { style: 'color:green' }],
      ],
    ])

    throw EarlyTerminate
  }

  if (result.type == 'error' || result.type == 'found') {
    sendInvalidMessage({
      context,
      selector,
      text: result.text,
      extra: result.extra,
    })
  }
}

function sendInvalidMessage(input: {
  context: WsContext
  text: string
  selector: string
  extra?: string
}) {
  let { context, text, selector, extra } = input

  let messages: ServerMessage[] = [
    ['update-text', selector, text],
    ['update-attrs', selector, { style: 'color:red' }],
  ]
  if (extra) {
    messages.push([
      'append',
      selector,
      [
        'span',
        {
          class: 'extra',
        },
        [extra],
      ],
    ])
  }
  context.ws.send(['batch', messages])
  throw EarlyTerminate
}

function CheckUsername(_: {}, context: WsContext) {
  let username = context.args?.[0] as string
  username = username?.toLowerCase()
  validateInput({
    context,
    value: username,
    field: 'username',
    selector: '#usernameMsg',
    validate: validateUsername,
  })
}

function CheckPassword(_: {}, context: WsContext) {
  let password = context.args?.[0] as string
  validateInput({
    context,
    value: password,
    field: 'password',
    selector: '#passwordMsg',
    validate: validatePassword,
  })
}

function CheckEmail(_: {}, context: WsContext) {
  let email = context.args?.[0] as string
  validateInput({
    context,
    value: email,
    field: 'email',
    selector: '#emailMsg',
    validate: validateEmail,
  })
}

async function submit(context: InputContext): Promise<Node> {
  try {
    let body = getContextFormBody(context)
    let input = {
      username: getStringCasual(body, 'username').trim().toLowerCase(),
      password: getStringCasual(body, 'password'),
      email: getStringCasual(body, 'email').trim().toLowerCase(),
      confirm_password: getStringCasual(body, 'confirm_password'),
    }
    let results = {
      usernameMsg: validateUsername(input.username),
      passwordMsg: validatePassword(input.password),
      emailMsg: validateEmail(input.email),
      confirmPasswordMsg: validateConfirmPassword(input),
    }
    let errors = Object.entries(results)
    let hasError = errors.some(entry => entry[1].type != 'ok')
    if (hasError) {
      context.contextError = Object.fromEntries<ValidateResult>(errors)
      context.values = input
      return RegisterPage
    }
    let id = proxy.user.push({
      username: input.username,
      password_hash: await hashPassword(input.password),
      email: input.email,
      tel: null,
    })

    let main: Node

    if (context.type === 'ws') {
      let token = encodeJwt({ id })
      getWsCookie(context.ws.ws).token = token
      let text = JSON.stringify({
        loginId: input.username,
        password: input.password,
      })
      text = JSON.stringify(text)
      main = (
        <>
          {renderUserMessageInGuestView('', input.username)}
          {Raw(/* html */ `<script>
fetch('/login/submit',{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: ${text}
})
</script>`)}
        </>
      )
    } else {
      main = (
        <p>
          You can now <a href="/login">login</a> to the system.
        </p>
      )
    }

    return (
      <div>
        <p>Register successfully.</p>
        <p hidden>
          TODO: A verification email has already been sent to your email
          address. Please check your inbox and spam folder.
        </p>
        {main}
      </div>
    )
  } catch (error) {
    return (
      <div>
        {renderError(error, context)}
        <Link href="/register">Try again</Link>
      </div>
    )
  }
}

let routes: Routes = {
  '/register': {
    title: title('Register'),
    description: `Register to access exclusive content and functionality. Join our community on ${config.short_site_name}.`,
    menuText: 'Register',
    menuUrl: '/register',
    guestOnly: true,
    node: RegisterPage,
  },
  '/register/check-username': {
    title: apiEndpointTitle,
    description: 'validate username and check availability',
    node: <CheckUsername />,
  },
  '/register/check-password': {
    title: apiEndpointTitle,
    description: 'validate password',
    node: <CheckPassword />,
  },
  '/register/check-email': {
    title: apiEndpointTitle,
    description: 'validate email and check availability',
    node: <CheckEmail />,
  },
  '/register/submit': {
    async resolve(context): Promise<StaticPageRoute> {
      return {
        title: apiEndpointTitle,
        description: 'register new account',
        node: await submit(context),
      }
    },
  },
}

export default { routes }
