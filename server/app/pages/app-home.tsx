import { config, title } from '../../config.js'
import { mapArray } from '../components/fragment.js'
import { Link } from '../components/router.js'
import { wsStatus } from '../components/ws-status.js'
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
      {wsStatus.safeArea}
    </ion-content>
  </>
)

let routes: Routes = {
  '/': {
    title: title('Home'),
    description:
      'List of fictional characters commonly used as placeholders in discussion about cryptographic systems and protocols.',
    node: homePage,
  },
}

export default { routes }
