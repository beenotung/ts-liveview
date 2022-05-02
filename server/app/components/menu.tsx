import { flagsToClassName } from '../jsx/html.js'
import JSX from '../jsx/jsx.js'
import type { attrs, Node } from '../jsx/types'
import { mapArray } from './fragment.js'
import { Link } from './router.js'
import { Style } from './style.js'
import { getContextUrl } from '../context.js'

export type MenuRoutes = Array<[url: string, text: string, alias?: string]>

export function Menu(attrs: {
  routes: MenuRoutes
  matchPrefix?: boolean
  separator?: Node
  attrs?: attrs
}) {
  const currentUrl = getContextUrl(attrs)
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
          ([href, text, alias]) => (
            <Link
              href={href}
              class={flagsToClassName({
                selected:
                  currentUrl === alias ||
                  (attrs.matchPrefix
                    ? currentUrl.startsWith(href)
                    : currentUrl === href),
              })}
            >
              {text}
            </Link>
          ),
          attrs.separator,
        )}
      </div>
    </>
  )
}
