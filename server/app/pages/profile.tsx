import { apiEndpointTitle, title } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
import { Link, Redirect } from '../components/router.js'
import { Context, ExpressContext } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { proxy } from '../../../db/proxy.js'
import { eraseUserIdFromCookie, getAuthUserId } from '../auth/user.js'

let ProfilePage = (_attrs: {}, context: Context) => {
  let user_id = getAuthUserId(context)

  return (
    <div id="profile">
      <h2>Profile Page</h2>
      <p>{commonTemplatePageText}</p>
      {user_id ? (
        renderProfile(user_id)
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

function renderProfile(user_id: number) {
  let user = proxy.user[user_id]
  return (
    <>
      <p>Welcome back, {user.username}</p>
      <a href="/logout">logout</a>
    </>
  )
}

function Logout(_attrs: {}, context: ExpressContext) {
  eraseUserIdFromCookie(context.res)
  return <Redirect href="/login" />
}

export function UserMessageInGuestView(attrs: { user_id: number }) {
  let username = proxy.user[attrs.user_id].username
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
