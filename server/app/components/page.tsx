import { config } from '../../config.js'
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
  headerColor?: ThemeColor
  contentColor?: ThemeColor
}

function IonicPage(attrs: PageAttrs) {
  let backHref = attrs.backHref ?? '/'
  return (
    <>
      {backHref || attrs.title ? (
        <ion-header>
          <ion-toolbar color={attrs.headerColor}>
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
        color={attrs.contentColor}
      >
        {attrs.children ? [attrs.children] : null}
      </ion-content>
    </>
  )
}

export let Page = IonicPage
