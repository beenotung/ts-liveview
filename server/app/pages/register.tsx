import { LayoutType, apiEndpointTitle, config, title } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
import { Link } from '../components/router.js'
import Style from '../components/style.js'
import {
  Context,
  getContextFormBody,
  WsContext,
  getStringCasual,
} from '../context.js'
import { EarlyTerminate } from '../../exception.js'
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
import { is_email, to_full_hk_mobile_phone } from '@beenotung/tslib/validate.js'
import { Raw } from '../components/raw.js'
import { hashPassword } from '../../hash.js'
import { Routes, StaticPageRoute } from '../routes.js'
import { Node } from '../jsx/types.js'
import { renderError } from '../components/error.js'
import { getWsCookies } from '../cookie.js'
import { getAuthUserId } from '../auth/user.js'
import { UserMessageInGuestView } from './profile.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { wsStatus } from '../components/ws-status.js'
import { formatTel } from '../components/tel.js'

let style = Style(/* css */ `
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
  margin-bottom: 0.5rem;
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
    <h1>Register on {config.short_site_name}</h1>
    <p hidden>{commonTemplatePageText}</p>
    <p>
      Welcome to {config.short_site_name}!
      <br />
      Let's begin the adventure~
    </p>
    <Main />
  </div>
)
if (config.layout_type === LayoutType.ionic) {
  RegisterPage = (
    <>
      {style}
      <ion-header>
        <ion-toolbar color="primary">
          <IonBackButton href="/" backText="Home" color="light" />
          <ion-title>Register</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div id="register">
          <p hidden>{commonTemplatePageText}</p>
          <p>
            Welcome to {config.short_site_name}!
            <br />
            Let's begin the adventure~
          </p>
          <Main />
        </div>
      </ion-content>
    </>
  )
}

function Main(_attrs: {}, context: Context) {
  let user_id = getAuthUserId(context)
  return user_id ? <UserMessageInGuestView user_id={user_id} /> : guestView
}

let verifyFormBody = (
  <>
    <Field
      label="Email"
      type="email"
      name="email"
      msgId="emailMsg"
      oninput="emit('/register/check-email', this.value)"
      autocomplete="email"
    />
    <Field
      label="Phone number"
      type="tel"
      name="tel"
      msgId="telMsg"
      oninput="emit('/register/check-tel', this.value)"
      autocomplete="tel"
    />
    {config.layout_type !== LayoutType.ionic ? (
      <div class="field">
        <label>
          <input type="checkbox" name="include_link" /> Include magic link (more
          convince but may be treated as spam)
        </label>
      </div>
    ) : (
      <ion-item>
        <ion-checkbox slot="start" name="include_link" />
        <ion-label>
          Include magic link (more convince but may be treated as spam)
        </ion-label>
      </ion-item>
    )}
    {config.layout_type !== LayoutType.ionic ? (
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

let guestView = (
  <>
    <p>
      Already have an account? <Link href="/login">Login</Link>
    </p>
    <div class="flex-center flex-column"></div>
    <div>Register with:</div>
    {config.use_social_login ? (
      <>
        <div class="flex-center flex-column">
          <div class="oauth-provider-list">
            <a>{googleLogo}&nbsp;Google</a>
            <a>{appleLogo}&nbsp;Apple</a>
            <a>{githubLogo}&nbsp;GitHub</a>
            <a>{facebookLogo}&nbsp;Facebook</a>
            <a>{instagramLogo}&nbsp;Instagram</a>
          </div>
        </div>
        <div class="or-line flex-center">or</div>
      </>
    ) : (
      <div style="height: 0.5rem"></div>
    )}
    <form
      method="POST"
      action="/verify/email/submit"
      onsubmit="emitForm(event)"
    >
      <p>Register with email or phone number</p>
      {verifyFormBody}
    </form>
    <div class="or-line flex-center">or</div>
    <form method="POST" action="/register/submit" onsubmit="emitForm(event)">
      <p>Register with username and password</p>
      <Field
        label="Username"
        name="username"
        msgId="usernameMsg"
        oninput="emit('/register/check-username', this.value)"
        autocomplete="username"
      />
      <Field
        label="Password"
        type="password"
        name="password"
        msgId="passwordMsg"
        oninput="emit('/register/check-password', this.value);this.form.confirm_password.value=''"
        autocomplete="new-password"
      />

      <Field
        label="Confirm password"
        type="password"
        name="confirm_password"
        msgId="confirmPasswordMsg"
        oninput="checkPassword(this.form||this.closest('form'))"
        autocomplete="new-password"
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
      {config.layout_type !== LayoutType.ionic ? (
        <input type="submit" value="Register" />
      ) : (
        <ion-button
          type="submit"
          class="ion-margin"
          fill="block"
          color="primary"
        >
          Register
        </ion-button>
      )}
      <ClearInputContext />
    </form>
    <div class="hint">
      Your password is not be stored in plain text.
      <br />
      Instead, it is processed with{' '}
      <a href="https://en.wikipedia.org/wiki/Argon2" target="_blank">
        Argon2 algorithm
      </a>{' '}
      to protect your credential against data leak.
    </div>
    {wsStatus.safeArea}
  </>
)

function Field(
  attrs: {
    label: string
    type?: string
    name: string
    oninput: string
    msgId: string
    autocomplete?: string
  },
  context: InputContext,
) {
  let value = context.values?.[attrs.name]
  let validateResult = context.contextError?.[attrs.msgId]
  if (config.layout_type === LayoutType.ionic) {
    return (
      <>
        <ion-item>
          <ion-input
            type={attrs.type}
            name={attrs.name}
            oninput={attrs.oninput}
            value={value}
            autocomplete={attrs.autocomplete}
            label={attrs.label}
            label-placement="floating"
          />
        </ion-item>
        <div style="margin-inline-start: 1rem">
          {renderErrorMessage(attrs.msgId, validateResult)}
        </div>
      </>
    )
  }
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
            autocomplete={attrs.autocomplete}
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
  values?: Record<string, string | null>
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

export function validateUsername(username: string): ValidateResult {
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

function validateEmail(email: string | null): ValidateResult {
  // email is optional
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
      text: `email "${email}" has already registered`,
      user,
    }
  }

  return { type: 'ok', text: `email "${email}" is valid` }
}

function validateTel(tel: string | null): ValidateResult {
  // tel is optional
  if (!tel) {
    return { type: 'ok', text: '' }
  }

  tel = to_full_hk_mobile_phone(tel)

  if (!tel) {
    return {
      type: 'error',
      text: 'invalid hk mobile phone number',
    }
  }

  let user = find(proxy.user, { tel })
  if (user) {
    return {
      type: 'found' as const,
      text: `tel "${formatTel(tel)}" has already registered`,
      user,
    }
  }

  return { type: 'ok', text: `tel "${formatTel(tel)}" is valid` }
}

function validateConfirmPassword(input: {
  password: string
  confirm_password: string
}): ValidateResult {
  if (!input.password)
    return {
      type: 'error',
      text: 'password not provided',
    }
  if (input.password != input.confirm_password)
    return {
      type: 'error',
      text: 'password not matched',
    }
  return {
    type: 'ok',
    text: 'password matched',
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

function CheckTel(_: {}, context: WsContext) {
  let tel = context.args?.[0] as string
  validateInput({
    context,
    value: tel,
    field: 'tel',
    selector: '#telMsg',
    validate: validateTel,
  })
}

async function submit(context: InputContext): Promise<Node> {
  try {
    let body = getContextFormBody(context)
    let input = {
      username: getStringCasual(body, 'username').trim().toLowerCase(),
      password: getStringCasual(body, 'password'),
      email: getStringCasual(body, 'email').trim().toLowerCase() || null,
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
      avatar: null,
      is_admin: null,
    })

    let main: Node

    if (context.type === 'ws') {
      let cookies = getWsCookies(context.ws.ws)
      if (cookies) {
        cookies.signedCookies.user_id = String(id)
      }
      let text = JSON.stringify({
        loginId: input.username,
        password: input.password,
      })
      text = JSON.stringify(text)
      main = (
        <>
          <UserMessageInGuestView user_id={id} />
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

let routes = {
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
  '/register/check-tel': {
    title: apiEndpointTitle,
    description: 'validate phone number and check availability',
    node: <CheckTel />,
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
} satisfies Routes

export default { routes }
