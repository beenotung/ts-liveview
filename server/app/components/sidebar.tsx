import { Context, getContextUrl } from '../context.js'
import { flagsToClassName } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { mapArray } from './fragment.js'
import { MenuRoute } from './menu.js'
import { Link } from './router.js'
import Style from './style.js'

let containerClass = 'sidebar-container'

let style = Style(/* css */ `
body {
	margin: 0;
}
.sidebar-container {
	display: flex;
	gap: 1rem;
}
.sidebar-brand {
	width: max-content;
}
.sidebar {
	border-right: 1px solid black;
	padding: 0.5rem;
}
.sidebar .sidebar-menu {
	margin-top: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	margin-inline-start: 0.5rem;
}
.sidebar .sidebar-menu-item {
	text-decoration: none;
	display: block;
	width: fit-content;
}
.sidebar .sidebar-menu-item.selected {
	border-bottom: 2px solid black;
}
`)

function Sidebar(
  attrs: { brand: Node; menuRoutes: MenuRoute[]; toggleId?: string },
  context: Context,
) {
  let currentUrl = getContextUrl(context)
  let toggleId = attrs.toggleId || 'navbar-menu-toggle'
  return (
    <nav class="sidebar">
      <div class="sidebar-brand">{attrs.brand}</div>
      <div class="sidebar-menu">
        {mapArray(attrs.menuRoutes, route => (
          <Link
            class={flagsToClassName({
              'sidebar-menu-item': true,
              'selected':
                currentUrl === route.url ||
                (route.menuUrl ? currentUrl === route.menuUrl : false),
            })}
            href={route.menuUrl || route.url}
          >
            {route.menuText}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default Object.assign(Sidebar, {
  style,
  containerClass,
})
