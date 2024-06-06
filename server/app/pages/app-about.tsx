import { LayoutType, title } from '../../config.js'
import { mapArray } from '../components/fragment.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { wsStatus } from '../components/ws-status.js'
import { DynamicContext } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { themeColorNames } from '../styles/mobile-style.js'

let pageTitle = 'About'

function BackButton(attr: {}, context: DynamicContext) {
  let from = new URLSearchParams(context.routerMatch?.search).get('from')
  if (from == 'more') {
    return <IonBackButton href="/app/more" backText="More" />
  }
  return <IonBackButton href="/app/home" backText="Home" />
}

let aboutPage = (
  <>
    <ion-header>
      <ion-toolbar>
        <BackButton />
        <ion-title role="heading" aria-level="1">
          {pageTitle}
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
      <h2>Theme Color</h2>
      <div>
        {mapArray(themeColorNames, color => (
          <ion-button color={color}>{color}</ion-button>
        ))}
        {mapArray(themeColorNames, color => (
          <ion-button fill="block" color={color}>
            {color}
          </ion-button>
        ))}
        {mapArray(themeColorNames, color => (
          <div class="d-flex">
            <div class="ion-padding flex-grow">
              <ion-text style="display: block" color={color}>
                {color}
              </ion-text>
            </div>
            <div
              class="ion-padding flex-grow"
              style={`
              background-color: var(--ion-color-${color});
              color: var(--ion-color-${color}-contrast);
              `}
            >
              {color}
            </div>
          </div>
        ))}
      </div>
      {wsStatus.safeArea}
    </ion-content>
  </>
)

let routes = {
  '/app/about': {
    title: title(pageTitle),
    description: `Demo using ionic and ts-liveview to build mobile-first SSR webapp`,
    node: aboutPage,
    layout_type: LayoutType.ionic,
  },
} satisfies Routes

export default { routes }
