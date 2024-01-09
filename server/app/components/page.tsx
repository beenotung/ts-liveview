import { config, LayoutType } from '../../config.js'
import { o } from '../jsx/jsx.js'
import { Node, NodeList } from '../jsx/types.js'

type PageAttrs = {
  style?: string
  id: string
  title?: string
  children?: NodeList
  backText?: string
  backHref?: string | false
  class?: string
}

function WebPage(attrs: PageAttrs) {
  return (
    <div id={attrs.id} class={attrs.class} style={attrs.style}>
      {attrs.title ? <h1>{attrs.title}</h1> : null}
      {attrs.children ? [attrs.children] : null}
    </div>
  )
}

export let Page = WebPage
