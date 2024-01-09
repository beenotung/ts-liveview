template_import="import { IonBackButton } from '../components/ion-back-button.js'
"
template_main="
let page = (
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

function Main(attrs: {}, context: Context) {
  let items = [1, 2, 3]
  return (
    <ion-list>
      {mapArray(items, item => (
        <ion-item>item {item}</ion-item>
      ))}
    </ion-list>
  )
}
"
