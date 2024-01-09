import { loadClientPlugin } from '../../client-plugin.js'
import { config, title } from '../../config.js'
import { mapArray } from '../components/fragment.js'
import { Link } from '../components/router.js'
import { wsStatus } from '../components/ws-status.js'
import { prerender } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { characters } from './app-character.js'

let homePage = (
  <>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Home</ion-title>
        <ion-buttons slot="end">
          <Link tagName="ion-button" href="/about" color="light">
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
      <hr style="height:1px; background-color:black;" />
      <div>
        Fictional characters commonly used as placeholders in discussions about
        cryptographic systems and protocols:
      </div>
      <ion-list>
        {mapArray(characters, character => (
          <Link tagName="ion-item" href={'/characters/' + character.id}>
            {character.name}
          </Link>
        ))}
      </ion-list>
      {loadClientPlugin({ entryFile: 'dist/client/sweetalert.js' }).node}
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
      {wsStatus.safeArea}
    </ion-content>
  </>
)

// pre-render into html to reduce time to first contentful paint (FCP)
homePage = prerender(homePage)

let routes: Routes = {
  '/': {
    title: title('Home'),
    description:
      'List of fictional characters commonly used as placeholders in discussion about cryptographic systems and protocols.',
    node: homePage,
  },
}

export default { routes }
