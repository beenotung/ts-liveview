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
      <Page id="profile" backHref="/app/more" title="Profile">
        <p>{commonTemplatePageText}</p>
        {user_id ? (
          renderProfile(user_id, context)
        ) : (
          <>
            <p>You are viewing this page as guest.</p>
            <p>
              You can <Link href="/login">login</Link> or{' '}
              <Link href="/register">register</Link> to manage your public
              profile and exclusive content.
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
      <p>Welcome back, {getDisplayName(user)}</p>
      <div class="divider">
        <hr />
        <span>For login</span>
        <hr />
      </div>
      <div>
        <label class="field">
          <span>User ID: </span>
          <span>{user_id}</span>
        </label>
      </div>
      <form
        method="POST"
        action="/profile/username/submit"
        onsubmit="emitForm(event)"
      >
        <label class="field">
          <span>Username: </span>
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
          Change
        </button>
      </form>
      <form method="POST" action="/verify/submit" onsubmit="emitForm(event)">
        <input name="tel" hidden />
        <label class="field">
          <span>Email: </span>
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
          Verify
        </button>
      </form>
      <form method="POST" action="/verify/submit" onsubmit="emitForm(event)">
        <input name="email" hidden />
        <label class="field">
          <span>Phone number: </span>
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
          Verify
        </button>
      </form>
      <div class="divider">
        <hr />
        <span>For display</span>
        <hr />
      </div>
      <form
        method="POST"
        action="/profile/nickname/submit"
        onsubmit="emitForm(event)"
      >
        <label class="field">
          <span>Nickname: </span>
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
          Change
        </button>
      </form>
      <form
        method="POST"
        action="/avatar"
        enctype="multipart/form-data"
        style="margin-bottom: 1rem"
      >
        <label class="field">
          <span>Avatar: </span>
          {user.avatar ? (
            <img class="avatar" src={'/uploads/' + user.avatar} />
          ) : (
            ' (none)'
          )}
        </label>
        <div></div>
        <label class="field">
          <span>Change avatar: </span>
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
            Logout
          </a>
        }
        ionic={
          <IonButton url="/logout" rel="nofollow" color="dark" expand="block">
            Logout
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
  return (
    <>
      <p>
        You have login as <b>{getDisplayName(user)}</b>.
      </p>
      <p>
        You can go to <Link href="/profile">profile page</Link> to manage your
        public profile and exclusive content.
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
    title: title('Profile Page'),
    description: `Manage your public profile and exclusive content`,
    menuText: 'Profile',
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
