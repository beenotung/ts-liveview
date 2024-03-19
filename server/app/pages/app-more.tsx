import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { config, title } from '../../config.js'
import Style from '../components/style.js'
import { Link } from '../components/router.js'
import { appIonTabBar } from '../components/app-tab-bar.js'
import { fitIonFooter, selectIonTab } from '../styles/mobile-style.js'
import { readFileSync } from 'fs'
import { Context } from '../context.js'
import { getAuthUser } from '../auth/user.js'

let pageTitle = 'More'

let style = Style(/* css */ `
#More {

}
`)

let page = (
  <>
    {style}
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title role="heading" aria-level="1">
          {pageTitle}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="More" class="ion-padding">
      <ion-avatar
        style="
          margin:auto;
          height:128px;
          width :128px;
        "
      >
        <img src="https://picsum.photos/seed/logo/128/128" />
      </ion-avatar>
      <h2
        style="
          margin-top:0.25rem;
          text-align:center;
        "
      >
        {config.site_name}
      </h2>
      <ion-list>
        <UserSection />
        <Link tagName="ion-item" href="/app/about?from=more">
          <ion-icon slot="start" name="information" />
          <ion-label>About Us</ion-label>
        </Link>
        <Link tagName="ion-item" href="/settings">
          <ion-icon slot="start" ios="cog" md="settings" />
          <ion-label>Settings</ion-label>
        </Link>
        <Link tagName="ion-item" href="/terms" disabled>
          <ion-icon slot="start" name="book" />
          <ion-label>Terms and Conditions</ion-label>
        </Link>
        <Link tagName="ion-item" href="/privacy" disabled>
          <ion-icon slot="start" name="glasses" />
          <ion-label>Privacy Policy</ion-label>
        </Link>
        <ion-item>
          <ion-icon slot="start" name="server" />
          <ion-label>
            Version{' '}
            {JSON.parse(readFileSync('package.json').toString()).version}
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer>
      {appIonTabBar}
      {selectIonTab('more')}
    </ion-footer>
    {fitIonFooter}
  </>
)

function UserSection(attrs: {}, context: Context) {
  let user = getAuthUser(context)
  return (
    <>
      {user ? (
        <>
          <Link tagName="ion-item" href="/profile">
            <ion-icon slot="start" name="person" />
            <ion-label>Profile</ion-label>
          </Link>
        </>
      ) : (
        <>
          <Link tagName="ion-item" href="/login">
            <ion-icon slot="start" name="log-in" />
            <ion-label>Login / Sign up</ion-label>
          </Link>
        </>
      )}
    </>
  )
}

let routes = {
  '/app/more': {
    title: title(pageTitle),
    description: 'TODO',
    node: page,
  },
} satisfies Routes

export default { routes }
