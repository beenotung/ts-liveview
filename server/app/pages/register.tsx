import { apiEndpointTitle, config } from '../../config.js'
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
import { proxy } from '../../../db/proxy.js'
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
import { wsStatus } from '../components/ws-status.js'
import { formatTel } from '../components/tel.js'
import { validateUsername, ValidateUserResult } from '../validate/user.js'
import { oauthProviderList } from '../components/oauth.js'
import { ClearInputContext, Field, InputContext } from '../components/field.js'
import { loadClientPlugin } from '../../client-plugin.js'
import { is_ionic, is_web, Page } from '../components/page.js'
import { IonButton } from '../components/ion-button.js'
import { Locale, Title } from '../components/locale.js'

let style = Style(/* css */ `
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
`)

let sweetAlertPlugin = loadClientPlugin({
  entryFile: 'dist/client/sweetalert.js',
})

let RegisterPage = (
  <>
    {style}
    <Page
      id="register"
      title={<Title t={<Locale en="Register" zh_hk="註冊" zh_cn="注册" />} />}
      backHref="/"
      backText={<Locale en="Home" zh_hk="主頁" zh_cn="主页" />}
      backColor="light"
      headerColor="primary"
    >
      <p>
        <Locale
          en={`Welcome to ${config.short_site_name}!`}
          zh_hk={`歡迎來到 ${config.short_site_name}！`}
          zh_cn={`欢迎来到 ${config.short_site_name}！`}
        />
        <br />
        <Locale
          en="Let's begin the adventure~"
          zh_hk="讓我們開始這場冒險吧~"
          zh_cn="让我们开始这场冒险吧~"
        />
      </p>
      <Main />
      {is_ionic && wsStatus.safeArea}
    </Page>
    {sweetAlertPlugin.node}
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
        label={<Locale en="Email" zh_hk="電郵地址" zh_cn="电子邮件地址" />}
        type="email"
        name="email"
        msgId="emailMsg"
        oninput="emit('/register/check-email', this.value)"
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
        <div style="margin: 0.5rem 0">
          <Locale en="or" zh_hk="或" zh_cn="或" />
        </div>
      ) : (
        <div style="margin-inline-start: 1rem; margin-top: 1rem">
          <Locale en="or" zh_hk="或" zh_cn="或" />
        </div>
      ))}
    {config.enable_sms && (
      <Field
        label={<Locale en="Phone number" zh_hk="電話號碼" zh_cn="电话号码" />}
        type="tel"
        name="tel"
        msgId="telMsg"
        oninput="emit('/register/check-tel', this.value)"
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
          <input type="checkbox" name="include_link" />{' '}
          <Locale
            en="Include magic link (more convenient but may be treated as spam)"
            zh_hk="包含登入鏈接 (更方便但可能被視為垃圾郵件)"
            zh_cn="包含登录链接 (更方便但可能被视为垃圾邮件)"
          />
        </label>
      </div>
    ) : (
      <>
        <ion-item>
          <ion-checkbox slot="start" name="include_link" />
          <ion-label style="pointer-events: none">
            <Locale
              en="Include magic link"
              zh_hk="包含登入鏈接"
              zh_cn="包含登录链接"
            />
          </ion-label>
        </ion-item>
        <ion-note color="dark">
          <Locale
            en="(More convenient but may be treated as spam)"
            zh_hk="(更方便但可能被視為垃圾郵件)"
            zh_cn="(更方便但可能被视为垃圾邮件)"
          />
        </ion-note>
      </>
    )}
    {is_web ? (
      <input
        type="submit"
        value={<Locale en="Verify" zh_hk="驗證" zh_cn="验证" />}
      />
    ) : (
      <ion-button
        type="submit"
        class="ion-margin"
        fill="block"
        color="tertiary"
      >
        <Locale en="Verify" zh_hk="驗證" zh_cn="验证" />
      </ion-button>
    )}
  </>
)

let guestView = (
  <>
    {config.use_social_login && (
      <>
        <div class="separator-line flex-center">
          <Locale
            en="Register with social network"
            zh_hk="使用社交網絡註冊"
            zh_cn="使用社交网络注册"
          />
        </div>
        <div class="flex-center flex-column">{oauthProviderList}</div>
      </>
    )}
    {config.use_verification_code &&
      (config.enable_email || config.enable_sms) && (
        <>
          <div class="separator-line flex-center">
            <Locale
              en="Register with verification code"
              zh_hk="使用驗證碼註冊"
              zh_cn="使用验证码注册"
            />
          </div>
          <form
            method="POST"
            action="/verify/submit"
            onsubmit="emitForm(event)"
          >
            {verifyFormBody}
          </form>
        </>
      )}
    <div class="separator-line flex-center">
      <Locale
        en="Register with password"
        zh_hk="使用密碼註冊"
        zh_cn="使用密码注册"
      />
    </div>
    <form
      id="verifyForm"
      method="POST"
      action="/register/submit"
      onsubmit="emitForm(event)"
    >
      <Field
        label={<Locale en="Username" zh_hk="用戶名" zh_cn="用户名" />}
        name="username"
        msgId="usernameMsg"
        oninput="emit('/register/check-username', this.value)"
        autocomplete="username"
      />
      <Field
        label={<Locale en="Password" zh_hk="密碼" zh_cn="密码" />}
        type="password"
        name="password"
        msgId="passwordMsg"
        oninput="emit('/register/check-password', this.value);this.form.confirm_password.value=''"
        autocomplete="new-password"
      />

      <Field
        label={
          <Locale en="Confirm password" zh_hk="確認密碼" zh_cn="确认密码" />
        }
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
      {is_web ? (
        <input
          type="submit"
          value={<Locale en="Register" zh_hk="註冊" zh_cn="注册" />}
        />
      ) : (
        <ion-button
          type="submit"
          class="ion-margin"
          expand="block"
          color="primary"
        >
          <Locale en="Register" zh_hk="註冊" zh_cn="注册" />
        </ion-button>
      )}
      <ClearInputContext />
    </form>
    <div class="hint-block">
      <Locale
        en="Your password is not be stored in plain text."
        zh_hk="你的密碼不會被儲存為明文。"
        zh_cn="你的密码不会被存储为明文。"
      />
      <br />
      <Locale
        en={
          <>
            Instead, it is processed with{' '}
            <a href="https://en.wikipedia.org/wiki/Argon2" target="_blank">
              Argon2 algorithm
            </a>{' '}
            to protect your password against data leak.
          </>
        }
        zh_hk={
          <>
            相反，它使用{' '}
            <a href="https://zh.wikipedia.org/zh-hk/Argon2" target="_blank">
              Argon2 算法
            </a>{' '}
            來保護你的密碼免受數據洩漏。
          </>
        }
        zh_cn={
          <>
            相反，它使用{' '}
            <a href="https://zh.wikipedia.org/zh-cn/Argon2" target="_blank">
              Argon2 算法
            </a>{' '}
            来保护你的密码免受数据泄露。
          </>
        }
      />
    </div>
    <div class="separator-line flex-center">
      <Locale
        en="Already have an account?"
        zh_hk="已經有帳號了嗎？"
        zh_cn="已经有一个账号了吗？"
      />
    </div>
    <div style="margin-bottom: 1rem">
      {is_web ? (
        <Link href="/login">
          <Locale en="Login" zh_hk="登入" zh_cn="登录" />
        </Link>
      ) : (
        <IonButton
          url="/login"
          expand="block"
          class="ion-margin"
          color="secondary"
        >
          <Locale en="Login" zh_hk="登入" zh_cn="登录" />
        </IonButton>
      )}
    </div>
  </>
)

let minPassword = 6
let maxPassword = 256

function validatePassword(password: string): ValidateUserResult {
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

function validateEmail(email: string | null): ValidateUserResult {
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

function validateTel(tel: string | null): ValidateUserResult {
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
}): ValidateUserResult {
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
  validate: (value: string) => ValidateUserResult
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

async function submit(
  context: InputContext<ValidateUserResult>,
): Promise<Node> {
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
      context.contextError = Object.fromEntries<ValidateUserResult>(errors)
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
      nickname: null,
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
          <Locale
            en={
              <>
                You can now <a href="/login">login</a> to the system.
              </>
            }
            zh_hk={
              <>
                你現在可以 <a href="/login">登入</a> 系統。
              </>
            }
            zh_cn={
              <>
                你现在可以 <a href="/login">登录</a> 系统。
              </>
            }
          />
        </p>
      )
    }

    return (
      <div>
        <p>
          <Locale
            en="Register successfully."
            zh_hk="註冊成功。"
            zh_cn="注册成功。"
          />
        </p>
        <p>
          <Locale
            en="A verification email has already been sent to your email address. Please check your inbox and spam folder."
            zh_hk="系統已經向你的電郵地址發送了驗證電郵。請檢查你的收件箱和垃圾郵件文件夾。"
            zh_cn="系统已经向你的电子邮件地址发送了验证电子邮件。请检查你的收件箱和垃圾邮件文件夹。"
          />
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
    title: <Locale en="Register" zh_hk="註冊" zh_cn="注册" />,
    description: (
      <Locale
        en={`Register to access exclusive content and functionality. Join our community on ${config.short_site_name}.`}
        zh_hk={`註冊以獲取獨家內容及功能。加入我們的社區，${config.short_site_name}。`}
        zh_cn={`注册以获取独家内容和功能。加入我们的社区，${config.short_site_name}。`}
      />
    ),
    menuText: <Locale en="Register" zh_hk="註冊" zh_cn="注册" />,
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
