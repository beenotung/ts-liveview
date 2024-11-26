import { config, LayoutType } from '../../config.js'
import { o } from '../jsx/jsx.js'
import { Node, NodeList } from '../jsx/types.js'
import { IonBackButton } from './ion-back-button.js'

type PageAttrs = {
  style?: string
  id: string
  title?: string
  children?: NodeList
  backText?: string
  backHref?: string
  class?: string
}

function IonicPage(attrs: PageAttrs) {
  return (
    <>
      {attrs.backHref || attrs.title ? (
        <ion-header>
          <ion-toolbar>
            {attrs.backHref ? (
              <IonBackButton href={attrs.backHref} backText={attrs.backText} />
            ) : null}
            {attrs.title ? (
              <ion-title role="heading" aria-level="1">
                {attrs.title}
              </ion-title>
            ) : null}
          </ion-toolbar>
        </ion-header>
      ) : null}
      <ion-content
        id={attrs.id}
        class={attrs.class ?? 'ion-padding'}
        style={attrs.style}
      >
        {attrs.children ? [attrs.children] : null}
      </ion-content>
    </>
  )
}

function WebPage(attrs: PageAttrs) {
  return (
    <div id={attrs.id} class={attrs.class} style={attrs.style}>
      {attrs.title ? <h1>{attrs.title}</h1> : null}
      {attrs.children ? [attrs.children] : null}
    </div>
  )
}

export let Page = config.layout_type === LayoutType.ionic ? IonicPage : WebPage

export function Content(attrs: { ionic?: Node; web?: Node }) {
  return config.layout_type === LayoutType.ionic ? attrs.ionic : attrs.web
}
