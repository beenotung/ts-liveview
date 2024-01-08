import { loadClientPlugin } from '../../client-plugin.js'
import { LayoutType, config, title } from '../../config.js'
import { appIonTabBar } from '../components/app-tab-bar.js'
import { mapArray } from '../components/fragment.js'
import { Link } from '../components/router.js'
import { Script } from '../components/script.js'
import Style from '../components/style.js'
import { wsStatus } from '../components/ws-status.js'
import { prerender } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { PageRoute, Routes } from '../routes.js'
import { fitIonFooter, selectIonTab } from '../styles/mobile-style.js'
import { characters } from './app-character.js'

let pageTitle = 'Home'

let style = Style(/* css */ `
/* This explicit height is necessary when using ion-menu */
#main-content {
  height: 100%;
}
`)

let script = Script(/* javascript */ `
function selectMenu(event, flag) {
  let item = event.currentTarget
  showToast('Selected ' + item.textContent)
  if (flag == 'close') {
    let menu = item.closest('ion-menu')
    menu.close()
  }
}
`)

let sweetAlertPlugin = loadClientPlugin({
  entryFile: 'dist/client/sweetalert.js',
})

let homePage = (
  <>
    {style}
    <ion-menu content-id="main-content" id="sideMenu">
      <ion-header>
        <ion-toolbar>
          <ion-title>Side Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item onclick="selectMenu(event)">Show Toast 1</ion-item>
          <ion-item onclick="selectMenu(event)">Show Toast 2</ion-item>
          <ion-item onclick="selectMenu(event, 'close')">
            Show Toast and Close Menu
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
    {/* This extra layer of div is only needed when using ion-menu */}
    <div id="main-content">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title role="heading" aria-level="1">
            {pageTitle}
          </ion-title>
          <ion-buttons slot="end">
            <Link tagName="ion-button" href="/app/about" color="light">
              About
            </Link>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p>
          You can get started by replacing the contents of this page in{' '}
          <code class="inline-code">app-home.tsx</code>.
        </p>
        <p>
          Hint: you can search a file by name in <b>vscode</b> by pressing{' '}
          <code class="inline-code keyboard">Ctrl + P</code> or{' '}
          <code class="inline-code keyboard">Cmd + P</code>.
          <br />
          <ion-note>(Cmd key looks like: ⌘)</ion-note>
        </p>
        <hr />
        <div>
          Fictional characters commonly used as placeholders in discussions
          about cryptographic systems and protocols:
        </div>
        <ion-list>
          {mapArray(characters, character => (
            <Link tagName="ion-item" href={'/app/characters/' + character.id}>
              {character.name}
            </Link>
          ))}
        </ion-list>
        {sweetAlertPlugin.node}
        <ion-button
          fill="block"
          color="primary"
          class="ion-margin-top"
          onclick="showToast('sample toast message','info')"
        >
          Show Toast
        </ion-button>
        <ion-button
          fill="block"
          color="primary"
          onclick="showAlert('sample alert message','info')"
        >
          Show Alert
        </ion-button>
        <ion-menu-toggle>
          <ion-button fill="block" color="primary">
            Show Side Menu
          </ion-button>
        </ion-menu-toggle>
        <Link
          tagName="ion-button"
          href="/login"
          fill="block"
          color="primary"
          class="ion-margin-top"
        >
          Login
        </Link>
        {wsStatus.safeArea}
      </ion-content>
    </div>
    <ion-footer>
      {appIonTabBar}
      {selectIonTab('home')}
    </ion-footer>
    {fitIonFooter}
    {script}
  </>
)

// pre-render into html to reduce time to first contentful paint (FCP)
homePage = prerender(homePage)

let homeRoute: PageRoute = {
  title: title(pageTitle),
  description:
    'List of fictional characters commonly used as placeholders in discussion about cryptographic systems and protocols.',
  menuText: 'Ionic App',
  menuFullNavigate: true,
  node: homePage,
  layout_type: LayoutType.ionic,
}

let routes = {
  ...(config.layout_type === LayoutType.ionic
    ? {
        '/': homeRoute,
      }
    : {}),
  '/app/home': homeRoute,
} satisfies Routes

export default { routes }
