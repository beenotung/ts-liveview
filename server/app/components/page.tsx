import { config, LayoutType } from '../../config.js'
import { o } from '../jsx/jsx.js'
import { Node, NodeList } from '../jsx/types.js'
import { IonBackButton } from './ion-back-button.js'

export type ThemeColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'light'
  | 'medium'
  | 'dark'

type PageAttrs = {
  style?: string
  id: string
  title?: string
  children?: NodeList
  backText?: string
  backHref?: string | false
  backColor?: ThemeColor
  class?: string
  color?: ThemeColor
}

function IonicPage(attrs: PageAttrs) {
  let backHref = attrs.backHref ?? '/'
  return (
    <>
      {backHref || attrs.title ? (
        <ion-header>
          <ion-toolbar color={attrs.color}>
            {backHref ? (
              <IonBackButton
                href={backHref}
                backText={attrs.backText}
                color={attrs.backColor}
              />
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

export let is_ionic = config.layout_type === LayoutType.ionic

export let Page = is_ionic ? IonicPage : WebPage

type Content = Node | (() => Node)

export function Content(attrs: { ionic?: Content; web?: Content }): Node {
  let content =
    config.layout_type === LayoutType.ionic ? attrs.ionic : attrs.web
  if (typeof content === 'function') {
    return content()
  }
  return content
}
