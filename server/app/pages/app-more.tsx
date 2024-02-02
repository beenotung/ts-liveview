import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { LayoutType, apiEndpointTitle, config, title } from '../../config.js'
import Style from '../components/style.js'
import { Context, DynamicContext, getContextFormBody } from '../context.js'
import { mapArray } from '../components/fragment.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { appIonTabBar } from '../components/app-tab-bar.js'
import { fitIonContent, selectIonTab } from '../styles/mobile-style.js'
import { readFileSync } from 'fs'

let pageTitle = 'More'

let style = Style(/* css */ `
#AppMore {

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
    <ion-content id="AppMore" class="ion-padding">
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
        <Link tagName="ion-item" href="/login" disabled>
          <ion-icon slot="start" name="log-in" />
          <ion-label>Login / Sign up</ion-label>
        </Link>
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
      <div>
        <ion-note>v1.0.0</ion-note>
      </div>
      {appIonTabBar}
      {selectIonTab('more')}
    </ion-footer>
    {fitIonContent('AppMore')}
  </>
)

let items = [
  { title: 'Android', slug: 'md' },
  { title: 'iOS', slug: 'ios' },
]

let routes: Routes = {
  '/more': {
    title: title(pageTitle),
    description: 'TODO',
    menuText: pageTitle,
    node: page,
    layout_type: LayoutType.ionic,
  },
}

export default { routes }
