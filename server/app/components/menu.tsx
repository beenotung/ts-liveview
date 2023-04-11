import { flagsToClassName } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import type { attrs, Node } from '../jsx/types'
import { mapArray } from './fragment.js'
import { Link } from './router.js'
import { Style } from './style.js'
import { Context, getContextUrl } from '../context.js'
import { capitalize } from '@beenotung/tslib/string.js'

export type MenuRoute = {
  url: string
  menuText: string
  menuUrl?: string // optional, default to be same as PageRoute.url
}

export function Menu(
  attrs: {
    routes: MenuRoute[]
    matchPrefix?: boolean
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
            <Link
              href={route.menuUrl || route.url}
              class={flagsToClassName({
                selected:
                  currentUrl === route.url ||
                  (route.menuUrl
                    ? attrs.matchPrefix
                      ? currentUrl.startsWith(route.menuUrl)
                      : currentUrl === route.menuUrl
                    : false),
              })}
            >
              {route.menuText}
            </Link>
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
