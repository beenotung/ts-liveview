import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { LayoutType, apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import { Context, DynamicContext, getContextFormBody } from '../context.js'
import { mapArray } from '../components/fragment.js'
import { appIonTabBar } from '../components/app-tab-bar.js'
import { fitIonContent, selectIonTab } from '../styles/mobile-style.js'

let pageTitle = 'Chat'

let style = Style(/* css */ `
#Chat {

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
    <ion-content id="Chat" class="ion-padding">
      Items
      <Main />
    </ion-content>
    <ion-footer>
      {appIonTabBar}
      {selectIonTab('chat')}
    </ion-footer>
    {fitIonContent('Chat')}
  </>
)

let items = [
  { title: 'Android', slug: 'md' },
  { title: 'iOS', slug: 'ios' },
]

function Main(attrs: {}, context: Context) {
  return (
    <>
      <ion-list>
        {mapArray(items, item => (
          <ion-item>
            {item.title} ({item.slug})
          </ion-item>
        ))}
      </ion-list>
    </>
  )
}

let routes: Routes = {
  '/app/chat': {
    title: title(pageTitle),
    description: 'TODO',
    menuText: pageTitle,
    node: page,
    layout_type: LayoutType.ionic,
  },
}

export default { routes }
