template_import="import { IonBackButton } from '../components/ion-back-button.js'
import { LayoutType, config } from '../../config.js'
"
template_main="
let page = (
  <>
    {style}
    <div id='$name'>
      <h1>{pageTitle}</h1>
      <Main/>
    </div>
  </>
)
if (config.layout_type === LayoutType.ionic) {
  page = (
    <>
      {style}
      <ion-header>
        <ion-toolbar>
          <IonBackButton href='/' backText='Home' />
          <ion-title>{pageTitle}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id='$name' class='ion-padding'>
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
"
