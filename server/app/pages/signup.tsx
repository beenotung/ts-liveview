import { email, object, string } from 'cast.ts'
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
import { proxy, User } from '../../../db/proxy.js'
import { ServerMessage } from '../../../client/types.js'
import { is_email } from '@beenotung/tslib'
import { Raw } from '../components/raw.js'
import { hashPassword } from '../../hash.js'

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
    <form onsubmit="emitForm(event)" action="/register/submit" method="POST">
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
          <input
            name="email"
            type="email"
            oninput="emit('/register/check-email', this.value)"
          />
        </div>
        <p id="emailMsg"></p>
      </label>
      <label>
        Password
        <div className="input-container">
          <input
            name="password"
            type="password"
            oninput="emit('/register/check-password', this.value);this.form.confirm_password.value=''"
          />
        </div>
        <p id="passwordMsg"></p>
      </label>
      <label>
        Confirm password
        <div className="input-container">
          <input
            name="confirm_password"
            type="password"
            oninput="checkPassword(this.form)"
          />
        </div>
      </label>
      <p id="confirmPasswordMsg"></p>
      {Raw(/* html */ `<script>
function checkPassword (form) {
  let c = form.confirm_password.value
  if (c.length == 0) {
    confirmPasswordMsg.textContent = ''
    return
  }
  let p = form.password.value
  if (p != c) {
    confirmPasswordMsg.textContent = 'Password not matched'
    confirmPasswordMsg.style.color = 'red'
    return
  }
  confirmPasswordMsg.textContent = 'Password matched'
  confirmPasswordMsg.style.color = 'green'
}
</script>`)}
      <input type="submit" value="Submit" />
    </form>
  )
}

type ValidateResult =
  | { type: 'error'; text: string; extra?: string }
  | {
      type: 'found'
      text: string
      user: User
      extra?: string
    }
  | { type: 'ok'; text: string }

let minUsername = 1
let maxUsername = 32

function validateUsername(username: string): ValidateResult {
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

function validateEmail(email: string): ValidateResult {
  if (!is_email(email)) {
    return { type: 'error', text: 'invalid email' }
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

function validateInput(input: {
  context: WsContext
  field: string
  value: string
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
        { style: 'color:darkred;display:block;margin-top:0.25rem' },
        [extra],
      ],
    ])
  }
  context.ws.send(['batch', messages])
  throw EarlyTerminate
}

function CheckUsername(_: {}, context: WsContext) {
  let username = context.args?.[0] as string
  username = username?.toLocaleLowerCase()
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

let formParser = object({
  username: string({ minLength: minUsername, maxLength: maxUsername }),
  password: string({ minLength: minPassword, maxLength: maxPassword }),
  confirm_password: string({ minLength: minPassword, maxLength: maxPassword }),
  email: email(),
})

function Submit(_attrs: {}, context: Context) {
  let body = getContextFormBody(context)
  try {
    let input = formParser.parse(body)
    if (input.password != input.confirm_password) {
      throw new Error('Password not matched')
    }
    proxy.user.push({
      username: input.username,
      // TODO hash with async function'
      password_hash: 'todo',
      email: input.email,
      tel: null,
    })
    return (
      <div>
        todo
        <pre>
          <code>{JSON.stringify(input, null, 2)}</code>
        </pre>
        <Link href="/register">again</Link>
      </div>
    )
  } catch (error) {
    let message = String(error)
      .replace('TypeError: ', '')
      .replace('Error: ', '')
    return (
      <div>
        <p style="color:darkred">{message}</p>
        <Link href="/register">Try again</Link>
      </div>
    )
  }
}

export default Switch({
  '/register': SignUpPage,
  '/register/check-username': <CheckUsername />,
  '/register/check-password': <CheckPassword />,
  '/register/check-email': <CheckEmail />,
  '/register/submit': <Submit />,
})
