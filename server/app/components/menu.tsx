import { flagsToClassName } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import type { attrs, Node } from '../jsx/types'
import { mapArray } from './fragment.js'
import { Style } from './style.js'
import { Context, getContextUrl } from '../context.js'
import { capitalize } from '@beenotung/tslib/string.js'

export type MenuRoute = {
  url: string
  menuText: string
  menuUrl?: string // optional, default to be same as PageRoute.url
  menuMatchPrefix?: boolean
  menuFullNavigate?: boolean // default false to enable ws updates
}

export function isCurrentMenuRoute(
  currentUrl: string,
  route: MenuRoute,
): boolean {
  return route.menuMatchPrefix
    ? currentUrl.startsWith(route.url) ||
        (route.menuUrl && currentUrl.startsWith(route.menuUrl)) ||
        false
    : currentUrl == route.url ||
        (route.menuUrl && currentUrl == route.menuUrl) ||
        false
}

export function Menu(
  attrs: {
    routes: MenuRoute[]
    separator?: Node
    attrs?: attrs
  },
  context: Context,
) {
  const currentUrl = getContextUrl(context)
  return (
    <>
      {Style(/* css */ `
.menu > a {
  margin: 0.25em;
  text-decoration: none;
  border-bottom: 1px solid black;
}
.menu > a.selected {
 border-bottom: 2px solid black;
}
`)}
      <div class="menu" {...attrs.attrs}>
        {mapArray(
          attrs.routes,
          route => (
            <a
              href={route.menuUrl || route.url}
              class={flagsToClassName({
                selected: isCurrentMenuRoute(currentUrl, route),
              })}
              onclick={route.menuFullNavigate ? undefined : 'emitHref(event)'}
            >
              {route.menuText}
            </a>
          ),
          attrs.separator,
        )}
      </div>
    </>
  )
}

export function formatMenuText(href: string): string {
  let text = href.substring(1)
  if (!text.includes('/')) {
    text = text.split('-').map(capitalize).join(' ')
  }
  return text
}

export default Menu
