import { apiEndpointTitle, title } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
import { Link, Redirect } from '../components/router.js'
import { Context, ExpressContext } from '../context.js'
import { getContextCookie } from '../cookie.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { decodeJwt } from '../jwt.js'
import { proxy } from '../../../db/proxy.js'

let ProfilePage = (_attrs: {}, context: Context) => {
  let token = getContextCookie(context)?.token

  return (
    <div id="profile">
      <h2>Profile Page</h2>
      <p>{commonTemplatePageText}</p>
      {token ? (
        renderProfile(token)
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

function renderProfile(token: string) {
  let id = decodeJwt(token).id
  let user = proxy.user[id]
  return (
    <>
      <p>Welcome back, {user.username}</p>
      <a href="/logout">logout</a>
    </>
  )
}

function Logout(_attrs: {}, context: ExpressContext) {
  context.res.clearCookie('token', {
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
  })
  return <Redirect href="/login" />
}

export function renderUserMessageInGuestView(
  token: string,
  username = tokenToUsername(token),
) {
  return (
    <>
      <p>
        You have login as <b>{username}</b>.
      </p>
      <p>
        You can go to <Link href="/profile">profile page</Link> to manage your
        public profile and exclusive content.
      </p>
    </>
  )
}

function tokenToUsername(token: string) {
  let id = decodeJwt(token).id
  let user = proxy.user[id]
  return user.username
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

export default { routes }
