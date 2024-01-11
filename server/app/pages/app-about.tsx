import { config, title } from '../../config.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'

let aboutPage = (
  <>
    <ion-header>
      <ion-toolbar>
        <IonBackButton href="/" backText="Home" />
        <ion-title role="heading" aria-level="1">
          About
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>
        This is a demo using{' '}
        <a href="https://ionicframework.com" target="_blank">
          ionic
        </a>{' '}
        and{' '}
        <a href="https://github.com/beenotung/ts-liveview" target="_blank">
          ts-liveview
        </a>{' '}
        to build mobile-first webapp.
      </p>
      <p>
        It leverages realtime <abbr title="Server-Side Rendering">SSR</abbr> to
        reduce loading time and support{' '}
        <abbr title="Search Engine Optimization">SEO</abbr>.
      </p>
    </ion-content>
  </>
)

let routes: Routes = {
  '/about': {
    title: title('About'),
    description: `Demo using ionic and ts-liveview to build mobile-first SSR webapp`,
    node: aboutPage,
  },
}

export default { routes }
