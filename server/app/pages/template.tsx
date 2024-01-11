import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import { Context } from '../context.js'
import { mapArray } from '../components/fragment.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { LayoutType, config } from '../../config.js'

let pageTitle = '__title__'

let style = Style(/* css */ `
#__id__ {

}
`)

let page = (
  <>
    {style}
    <div id="__id__">
      <h1>{pageTitle}</h1>
      <Main />
    </div>
  </>
)
if (config.layout_type === LayoutType.ionic) {
  page = (
    <>
      {style}
      <ion-header>
        <ion-toolbar>
          <IonBackButton href="/" backText="Home" />
          <ion-title>{pageTitle}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id="__id__" class="ion-padding">
        Items
        <Main />
      </ion-content>
    </>
  )
}

function Main(attrs: {}, context: Context) {
  let items = [1, 2, 3]
  if (config.layout_type !== LayoutType.ionic) {
    return (
      <ul>
        {mapArray(items, item => (
          <li>item {item}</li>
        ))}
      </ul>
    )
  }
  return (
    <ion-list>
      {mapArray(items, item => (
        <ion-item>item {item}</ion-item>
      ))}
    </ion-list>
  )
}

function Submit() {
  return 'TODO'
}

let routes: Routes = {
  '/__url__': {
    title: title(pageTitle),
    description: 'TODO',
    menuText: pageTitle,
    node: page,
  },
  '/__url__/submit': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <Submit />,
    streaming: false,
  },
}

export default { routes }
