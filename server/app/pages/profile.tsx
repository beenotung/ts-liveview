import { apiEndpointTitle, title } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
import { Link, Redirect } from '../components/router.js'
import {
  DynamicContext,
  ExpressContext,
  getContextFormBody,
  getContextSearchParams,
} from '../context.js'
import { o } from '../jsx/jsx.js'
import { PageRoute, Routes } from '../routes.js'
import { proxy, User } from '../../../db/proxy.js'
import {
  eraseUserIdFromCookie,
  getAuthUser,
  getAuthUserId,
} from '../auth/user.js'
import { Router } from 'express'
import { createUploadForm } from '../upload.js'
import Style from '../components/style.js'
import { renderError } from '../components/error.js'
import { Raw } from '../components/raw.js'
import { loadClientPlugin } from '../../client-plugin.js'
import { formatTel } from '../components/tel.js'
import { validateNickname, validateUsername } from '../validate/user.js'
import { object, string } from 'cast.ts'
import { MessageException } from '../../exception.js'
import { Content, Page } from '../components/page.js'
import { IonButton } from '../components/ion-button.js'
import { Locale, Title } from '../components/locale.js'

let pageTitle = <Locale en="Profile" zh_hk="帳戶" zh_cn="账户" />

let style = Style(/* css */ `
#profile .avatar {
  max-width: 128px;
  max-height: 128px;
}
#profile #previewImg {
  max-width: 160px;
  max-height: 160px;
}
#profile .field {
  display: inline-flex;
  margin: 0.25rem 0;
}
#profile .field span {
  display: inline-block;
  min-width: 7.5rem;
}
#profile .field input {
  max-width: 40vw;
}
#profile .divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 32rem;
  opacity: 0.5;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
}
#profile .divider hr {
  flex-grow: 1;
}
`)

let imagePlugin = loadClientPlugin({
  entryFile: 'dist/client/image.js',
})

let ProfilePage = (_attrs: {}, context: DynamicContext) => {
  let user_id = getAuthUserId(context)

  return (
    <>
      {style}
      <Page id="profile" backHref="/app/more" title={pageTitle}>
        <p>{commonTemplatePageText}</p>
        {user_id ? (
          renderProfile(user_id, context)
        ) : (
          <>
            <p>
              <Locale
                en="You are viewing this page as guest."
                zh_hk="您正在以訪客身份查看此頁面。"
                zh_cn="您正在以访客身份查看此页面。"
              />
            </p>
            <p>
              <Locale
                en={
                  <>
                    You can <Link href="/login">login</Link> or{' '}
                    <Link href="/register">register</Link> to manage your public
                    profile and exclusive content.
                  </>
                }
                zh_hk={
                  <>
                    您可以 <Link href="/login">登入</Link> 或{' '}
                    <Link href="/register">註冊</Link>{' '}
                    以管理您的公開帳戶和專屬內容。
                  </>
                }
                zh_cn={
                  <>
                    您可以 <Link href="/login">登录</Link> 或{' '}
                    <Link href="/register">注册</Link>{' '}
                    以管理您的公开账户和专属内容。
                  </>
                }
              />
            </p>
          </>
        )}
      </Page>
    </>
  )
}

let toastPlugin = loadClientPlugin({ entryFile: 'dist/client/sweetalert.js' })

export function getDisplayName(user: User) {
  return (
    user.nickname ||
    user.username ||
    user.email ||
    formatTel(user.tel) ||
    `user-${user.id}`
  )
}

function renderProfile(user_id: number, context: DynamicContext) {
  let user = proxy.user[user_id]
  let params = getContextSearchParams(context)
  let error = params?.get('error')
  return (
    <>
      <p>
        <Locale en="Welcome back, " zh_hk="歡迎回來，" zh_cn="欢迎回来，" />
        {getDisplayName(user)}
      </p>
      <div class="divider">
        <hr />
        <span>
          <Locale en="For login" zh_hk="登入資訊" zh_cn="登录信息" />
        </span>
        <hr />
      </div>
      <div>
        <label class="field">
          <span>
            <Locale en="User ID: " zh_hk="用戶 ID: " zh_cn="用户 ID: " />
          </span>
          <span>{user_id}</span>
        </label>
      </div>
      <form
        method="POST"
        action="/profile/username/submit"
        onsubmit="emitForm(event)"
      >
        <label class="field">
          <span>
            <Locale en="Username: " zh_hk="用戶名: " zh_cn="用户名: " />
          </span>
          <input
            type="text"
            name="username"
            autocomplete="off"
            value={user.username}
            data-value={user.username}
            oninput="submitUsernameBtn.disabled = this.value === this.dataset.value || !this.value"
          />
        </label>{' '}
        <button type="submit" id="submitUsernameBtn" disabled>
          <Locale en="Change" zh_hk="更改" zh_cn="更改" />
        </button>
      </form>
      <form method="POST" action="/verify/submit" onsubmit="emitForm(event)">
        <input name="tel" hidden />
        <label class="field">
          <span>
            <Locale en="Email: " zh_hk="電郵地址: " zh_cn="邮箱地址: " />
          </span>
          <input
            type="email"
            name="email"
            autocomplete="email"
            value={user.email}
            data-value={user.email}
            oninput="submitEmailBtn.disabled = this.value === this.dataset.value || !this.value"
          />
        </label>{' '}
        <button type="submit" id="submitEmailBtn" disabled>
          <Locale en="Verify" zh_hk="驗證" zh_cn="验证" />
        </button>
      </form>
      <form method="POST" action="/verify/submit" onsubmit="emitForm(event)">
        <input name="email" hidden />
        <label class="field">
          <span>
            <Locale en="Phone number: " zh_hk="電話號碼: " zh_cn="电话号码: " />
          </span>
          <input
            type="tel"
            name="tel"
            autocomplete="tel"
            value={user.tel}
            data-value={user.tel}
            oninput="submitTelBtn.disabled = this.value === this.dataset.value || !this.value"
          />
        </label>{' '}
        <button type="submit" id="submitTelBtn" disabled>
          <Locale en="Verify" zh_hk="驗證" zh_cn="验证" />
        </button>
      </form>
      <div class="divider">
        <hr />
        <span>
          <Locale en="For display" zh_hk="顯示資訊" zh_cn="显示信息" />
        </span>
        <hr />
      </div>
      <form
        method="POST"
        action="/profile/nickname/submit"
        onsubmit="emitForm(event)"
      >
        <label class="field">
          <span>
            <Locale en="Nickname: " zh_hk="稱呼: " zh_cn="称呼: " />
          </span>
          <input
            type="text"
            name="nickname"
            autocomplete="off"
            value={user.nickname}
            data-value={user.nickname}
            oninput="submitNicknameBtn.disabled = this.value === this.dataset.value || !this.value"
          />
        </label>{' '}
        <button type="submit" id="submitNicknameBtn" disabled>
          <Locale en="Change" zh_hk="更改" zh_cn="更改" />
        </button>
      </form>
      <form
        method="POST"
        action="/avatar"
        enctype="multipart/form-data"
        style="margin-bottom: 1rem"
      >
        <label class="field">
          <span>
            <Locale en="Avatar: " zh_hk="頭像: " zh_cn="头像: " />
          </span>
          {user.avatar ? (
            <img class="avatar" src={'/uploads/' + user.avatar} />
          ) : (
            <Locale en=" (none)" zh_hk=" (無)" zh_cn=" (无)" />
          )}
        </label>
        <div></div>
        <label class="field">
          <span>
            <Locale
              en="Change avatar: "
              zh_hk="更改頭像: "
              zh_cn="更改头像: "
            />
          </span>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onchange="previewAvatar(this)"
          />
        </label>
        <div id="previewContainer" hidden>
          <div id="previewMessage"></div>
          <img id="previewImg" />
          <br />
          <input type="submit" value="Upload Avatar" />
        </div>
        {error ? renderError(error, context) : null}
        {Raw(/* html */ `
${imagePlugin.script}
<script>
async function previewAvatar(input) {
  let [image] = await compressPhotos(input.files)
  if (!image) return
  previewImg.src = image.dataUrl
  let kb = Math.ceil(image.file.size / 1024)
  previewMessage.textContent = 'Image Preview (' + kb + ' KB)'
  let list = new DataTransfer()
  list.items.add(image.file)
  input.files = list.files
  previewContainer.hidden = false
}
</script>
${toastPlugin.script}
`)}
      </form>
      <hr style="margin-bottom: 2rem" />
      {/* TODO make a popup confirm for logout */}
      <Content
        web={
          <a href="/logout" rel="nofollow">
            <Locale en="Logout" zh_hk="登出" zh_cn="登出" />
          </a>
        }
        ionic={
          <IonButton url="/logout" rel="nofollow" color="dark" expand="block">
            <Locale en="Logout" zh_hk="登出" zh_cn="登出" />
          </IonButton>
        }
      ></Content>
    </>
  )
}

function Logout(_attrs: {}, context: ExpressContext) {
  eraseUserIdFromCookie(context.res)
  return <Redirect href="/login" />
}

export function UserMessageInGuestView(attrs: { user_id: number }) {
  let user = proxy.user[attrs.user_id]
  let name = getDisplayName(user)
  return (
    <>
      <p>
        <Locale
          en={
            <>
              You have login as <b>{name}</b>.
            </>
          }
          zh_hk={
            <>
              您已登入為 <b>{name}</b>。
            </>
          }
          zh_cn={
            <>
              您已登录为 <b>{name}</b>。
            </>
          }
        />
      </p>
      <p>
        <Locale
          en={
            <>
              You can go to <Link href="/profile">profile page</Link> to manage
              your public profile and exclusive content.
            </>
          }
          zh_hk={
            <>
              您可以前往 <Link href="/profile">帳戶頁面</Link>{' '}
              以管理您的公開帳戶和專屬內容。
            </>
          }
          zh_cn={
            <>
              您可以前往 <Link href="/profile">账户页面</Link>{' '}
              以管理您的公开账户和专属内容。
            </>
          }
        />
      </p>
    </>
  )
}

function attachRoutes(app: Router) {
  app.post('/avatar', async (req, res, next) => {
    try {
      let user_id = getAuthUserId({
        type: 'express',
        req,
        res,
        next,
        url: req.url,
      })
      if (!user_id) throw 'not login'

      let user = proxy.user[user_id]
      if (!user) throw 'user not found'

      let form = createUploadForm()
      let [fields, files] = await form.parse(req)

      let file = files.avatar?.[0]
      if (!file) throw 'missing avatar file'

      user.avatar = file.newFilename

      res.redirect('/profile')
    } catch (error) {
      if (typeof error !== 'string') {
        console.error(error)
      }
      res.redirect('/profile?' + new URLSearchParams({ error: String(error) }))
    }
  })
}

let changeUsernameParser = object({
  username: string(),
})

function ChangeUsername(attrs: {}, context: DynamicContext) {
  let user = getAuthUser(context)
  if (!user) throw 'not login'

  let body = getContextFormBody(context)
  let { username } = changeUsernameParser.parse(body)

  if (user.username !== username) {
    let result = validateUsername(username)
    if (result.type === 'ok') {
      user.username = username
      if (context.type === 'ws') {
        throw new MessageException([
          'batch',
          [
            ['eval', `showToast('updated username','success')`],
            [
              'update-attrs',
              'input[name="username"]',
              {
                'value': username,
                'data-value': username,
              },
            ],
            ['update-props', '#submitUsernameBtn', { disabled: true }],
          ],
        ])
      }
    } else {
      if (context.type === 'ws') {
        throw new MessageException([
          'eval',
          `showAlert(${JSON.stringify(result.text)},'warning')`,
        ])
      }
    }
  }

  return <Redirect href="/profile" />
}

let changeNicknameParser = object({
  nickname: string(),
})

function ChangeNickname(attrs: {}, context: DynamicContext) {
  let user = getAuthUser(context)
  if (!user) throw 'not login'

  let body = getContextFormBody(context)
  let { nickname } = changeNicknameParser.parse(body)

  if (user.nickname !== nickname) {
    let result = validateNickname(nickname)
    if (result.type === 'ok') {
      user.nickname = nickname
      if (context.type === 'ws') {
        throw new MessageException([
          'batch',
          [
            ['eval', `showToast('updated nickname','success')`],
            [
              'update-attrs',
              'input[name="nickname"]',
              {
                'value': nickname,
                'data-value': nickname,
              },
            ],
            ['update-props', '#submitNicknameBtn', { disabled: true }],
          ],
        ])
      }
    } else {
      if (context.type === 'ws') {
        throw new MessageException([
          'eval',
          `showAlert(${JSON.stringify(result.text)},'warning')`,
        ])
      }
    }
  }

  return <Redirect href="/profile" />
}

let routes = {
  '/profile': {
    title: <Title t={pageTitle} />,
    description: (
      <Locale
        en="Manage your public profile and exclusive content"
        zh_hk="管理您的公開帳戶和專屬內容"
        zh_cn="管理您的公开账户和专属内容"
      />
    ),
    menuText: pageTitle,
    adminOnly: true,
    userOnly: true,
    node: <ProfilePage />,
  },
  '/profile/username/submit': {
    title: apiEndpointTitle,
    description: 'change username',
    streaming: false,
    node: <ChangeUsername />,
  },
  '/profile/nickname/submit': {
    title: apiEndpointTitle,
    description: 'change nickname',
    streaming: false,
    node: <ChangeNickname />,
  },
  '/logout': {
    title: apiEndpointTitle,
    description: 'logout your account',
    streaming: false,
    node: <Logout />,
  },
} satisfies Routes

export default { routes, attachRoutes }
