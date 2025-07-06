import { apiEndpointTitle, config, title } from '../../config.js'
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
import { oauthProviderList } from '../components/oauth.js'
import { Field } from '../components/field.js'
import { is_ionic, is_web, Page } from '../components/page.js'
import { loadClientPlugin } from '../../client-plugin.js'
import { IonButton } from '../components/ion-button.js'
import { Locale } from '../components/locale.js'

let style = Style(/* css */ `
#login .field {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
`)

let sweetAlertPlugin = loadClientPlugin({
  entryFile: 'dist/client/sweetalert.js',
})

let LoginPage = (
  <>
    {style}
    <Page
      id="login"
      title="Login"
      backHref="/"
      backText="Home"
      backColor="light"
      headerColor="primary"
    >
      <p>
        <Locale
          en={`Welcome back to ${config.short_site_name}!`}
          zh_hk={`歡迎回來 ${config.short_site_name}！`}
          zh_cn={`欢迎回来 ${config.short_site_name}！`}
        />
      </p>
      <Main />
      {sweetAlertPlugin.node}
      {is_ionic && wsStatus.safeArea}
    </Page>
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
          <ion-checkbox slot="start" name="include_link"></ion-checkbox>
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

let passwordFormBody = (
  <>
    <Field
      label={
        <Locale
          en="Username, email, or phone number"
          zh_hk="用戶名, 電郵地址, 或電話號碼"
          zh_cn="用户名, 电子邮件地址, 或电话号码"
        />
      }
      name="loginId"
      msgId="loginIdMsg"
      autocomplete="username"
      required
    />
    <Field
      label={<Locale en="Password" zh_hk="密碼" zh_cn="密码" />}
      name="password"
      msgId="passwordMsg"
      type="password"
      autocomplete="current-password"
      required
    />
    {is_web ? (
      <div class="input-container">
        <input
          type="submit"
          value={<Locale en="Login" zh_hk="登入" zh_cn="登录" />}
        />
      </div>
    ) : (
      <div class="ion-text-center ion-margin">
        <ion-button type="submit" fill="block" color="primary">
          <Locale en="Login" zh_hk="登入" zh_cn="登录" />
        </ion-button>
      </div>
    )}
    <Message />
  </>
)

let guestView = (
  <>
    {config.use_social_login && (
      <>
        <div class="separator-line flex-center">
          <Locale
            en="Login with social network"
            zh_hk="使用社交網絡登入"
            zh_cn="使用社交网络登录"
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
              en="Login with verification code"
              zh_hk="使用驗證碼登入"
              zh_cn="使用验证码登录"
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
        en="Login with password"
        zh_hk="使用密碼登入"
        zh_cn="使用密码登录"
      />
    </div>
    <form method="post" action="/login/submit">
      {passwordFormBody}
    </form>
    <div class="separator-line flex-center">
      <Locale
        en={`New to ${config.short_site_name}?`}
        zh_hk={`新來 ${config.short_site_name}？`}
        zh_cn={`新来 ${config.short_site_name}？`}
      />
    </div>
    <div style="margin-bottom: 1rem">
      {is_web ? (
        <Link href="/register">
          <Locale en="Create an account" zh_hk="註冊帳號" zh_cn="注册账号" />
        </Link>
      ) : (
        <IonButton
          url="/register"
          expand="block"
          class="ion-margin"
          color="secondary"
        >
          <Locale en="Create an account" zh_hk="註冊帳號" zh_cn="注册账号" />
        </IonButton>
      )}
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
    title: <Locale en="Login" zh_hk="登入" zh_cn="登录" />,
    description: (
      <Locale
        en={`Login to access exclusive content and features. Welcome back to our community on ${config.short_site_name}.`}
        zh_hk={`登入以獲取獨家內容及功能。歡迎回到我們的社區，${config.short_site_name}。`}
        zh_cn={`登录以获取独家内容和功能。欢迎回到我们的社区，${config.short_site_name}。`}
      />
    ),
    menuText: <Locale en="Login" zh_hk="登入" zh_cn="登录" />,
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
