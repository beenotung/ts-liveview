import { Context, getContextUrl } from '../context.js'
import { menuIcon } from '../icons/menu.js'
import { flagsToClassName } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { mapArray } from './fragment.js'
import { MenuRoute, isCurrentMenuRoute } from './menu.js'
import { Link } from './router.js'
import Style from './style.js'
import { getAuthUserId } from '../auth/user.js'

let containerClass = 'sidebar-container'
let mainContainerClass = 'sidebar-main-container'

let style = Style(/* css */ `
body {
	margin: 0;
}
.sidebar-container {
	display: flex;
	height: 100vh;
}
.sidebar-main-container {
	max-height: 100vh;
	overflow: auto;
	flex-grow: 1;
}
.sidebar {
	border-right: 1px solid black;
}
.sidebar-top-container {
	margin: 0.5rem;
	display: flex;
}
.sidebar-brand {
	width: max-content;
	margin-inline-end: 0.5rem;
}
.sidebar .sidebar-menu-toggle {
	display: flex;
	justify-content: center;
	align-items: center;
}
.sidebar .sidebar-menu-toggle .icon {
	width: 2rem;
	height: 2rem;
}
.sidebar [name=sidebar-menu-toggle] {
	display: none;
}
.sidebar .sidebar-menu-toggle {
	background-color: #fff8;
}
.sidebar .sidebar-menu {
	margin: 0.5rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	margin-inline-start: 1rem;
}
.sidebar-foldable {
	width: 100%;
	transition: width 0.3s;
}
.sidebar-foldable-animation {
	animation-delay: 0.3s;
	animation-duration: 0;
	animation-fill-mode: forwards;
}
@keyframes sidebar-menu-toggle {
	100% {
		position: fixed;
		top: 0;
		left: 0;
	}
}
.sidebar [name=sidebar-menu-toggle]:checked ~ .sidebar-top-container .sidebar-menu-toggle {
	animation-name: sidebar-menu-toggle;
}
@keyframes sidebar-top-container {
	100% {
		margin: 0;
	}
}
.sidebar [name=sidebar-menu-toggle]:checked ~ .sidebar-top-container {
	animation-name: sidebar-top-container;
}
.sidebar [name=sidebar-menu-toggle]:checked ~ .sidebar-top-container .sidebar-foldable,
.sidebar [name=sidebar-menu-toggle]:checked ~ .sidebar-foldable {
	width: 0;
	overflow: hidden;
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
  let hasLogin = !!getAuthUserId(context)
  let toggleId = attrs.toggleId || 'sidebar-menu-toggle'
  return (
    <nav class="sidebar">
      <input name="sidebar-menu-toggle" type="checkbox" id={toggleId} />
      <div class="sidebar-top-container sidebar-foldable-animation">
        <div class="sidebar-foldable">
          <div class="sidebar-brand">{attrs.brand}</div>
        </div>
        <label
          class="sidebar-menu-toggle sidebar-foldable-animation"
          for={toggleId}
          aria-label="toggle navigation menu"
        >
          {menuIcon}
        </label>
      </div>
      <div class="sidebar-foldable">
        <div class="sidebar-menu">
          {mapArray(attrs.menuRoutes, route =>
            (route.guestOnly && hasLogin) ||
            (route.userOnly && !hasLogin) ? null : (
              <Link
                class={flagsToClassName({
                  'sidebar-menu-item': true,
                  'selected': isCurrentMenuRoute(currentUrl, route),
                })}
                href={route.menuUrl || route.url}
              >
                {route.menuText}
              </Link>
            ),
          )}
        </div>
      </div>
    </nav>
  )
}

export default Object.assign(Sidebar, {
  style,
  containerClass,
  mainContainerClass,
})
