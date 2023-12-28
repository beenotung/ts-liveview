import { apiEndpointTitle, title } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
import { Link, Redirect } from '../components/router.js'
import { DynamicContext, ExpressContext } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Routes, getContextSearchParams } from '../routes.js'
import { proxy } from '../../../db/proxy.js'
import { eraseUserIdFromCookie, getAuthUserId } from '../auth/user.js'
import { Router } from 'express'
import { createUploadForm } from '../upload.js'
import { HttpError } from '../../http-error.js'
import Style from '../components/style.js'
import { renderError } from '../components/error.js'
import { Raw } from '../components/raw.js'
import { loadClientPlugin } from '../../client-plugin.js'

let style = Style(/* css */ `
#profile .avatar {
  max-width: 128px;
  max-height: 128px;
}
#profile #previewImg {
  max-width: 160px;
  max-height: 160px;
}
`)

let imagePlugin = loadClientPlugin({
  entryFile: 'dist/client/image.js',
})

let ProfilePage = (_attrs: {}, context: DynamicContext) => {
  let user_id = getAuthUserId(context)

  return (
    <div id="profile">
      {style}
      <h1>Profile Page</h1>
      <p>{commonTemplatePageText}</p>
      {user_id ? (
        renderProfile(user_id, context)
      ) : (
        <>
          <p>You are viewing this page as guest.</p>
          <p>
            You can <Link href="/login">login</Link> or{' '}
            <Link href="/register">register</Link> to manage your public profile
            and exclusive content.
          </p>
        </>
      )}
    </div>
  )
}

function renderProfile(user_id: number, context: DynamicContext) {
  let user = proxy.user[user_id]
  let params = getContextSearchParams(context)
  let error = params.get('error')
  return (
    <>
      <p>Welcome back, {user.username || user.email}</p>
      <form
        method="POST"
        action="/avatar"
        enctype="multipart/form-data"
        style="margin-bottom: 1rem"
      >
        <div>
          Avatar:
          {user.avatar ? (
            <div>
              <img class="avatar" src={'/uploads/' + user.avatar} />
            </div>
          ) : (
            ' (none)'
          )}
        </div>
        <label>
          Change avatar:{' '}
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
`)}
      </form>
      <a href="/logout" rel="nofollow">
        Logout
      </a>
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
        You have login as <b>{user.username || user.email}</b>.
      </p>
      <p>
        You can go to <Link href="/profile">profile page</Link> to manage your
        public profile and exclusive content.
      </p>
    </>
  )
}

function attachRoutes(app: Router) {
  app.post('/avatar', (req, res, next) => {
    let reject = (status: number, error: string) => {
      res.redirect('/profile?' + new URLSearchParams({ error }))
    }

    let user_id = getAuthUserId({
      type: 'express',
      req,
      res,
      next,
      url: req.url,
    })
    if (!user_id) return reject(403, 'not login')

    let user = proxy.user[user_id]
    if (!user) return reject(404, 'user not found')

    let form = createUploadForm({
      mimeTypeRegex: /^image\/.+/,
      maxFileSize: 300 * 1024,
    })
    form.parse(req, (err, fields, files) => {
      if (err) return next(err)

      let file = files.avatar?.[0]
      if (!file) return reject(400, 'missing avatar file')

      user.avatar = file.newFilename
      res.redirect('/profile')
    })
  })
}

let routes: Routes = {
  '/profile': {
    title: title('Profile Page'),
    description: `Manage your public profile and exclusive content`,
    menuText: 'Profile',
    userOnly: true,
    node: <ProfilePage />,
  },
  '/logout': {
    title: apiEndpointTitle,
    description: 'logout your account',
    streaming: false,
    node: <Logout />,
  },
}

export default { routes, attachRoutes }
