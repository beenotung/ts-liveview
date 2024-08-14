import { Context, getContextUrl } from '../context.js'
import { flagsToClassName } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { mapArray } from './fragment.js'
import {
  MenuRoute,
  isCurrentMenuRoute,
  isCurrentMenuRouteAllowed,
} from './menu.js'
import Style from './style.js'
import { menuIcon } from '../icons/menu.js'
import { PickLanguage } from './ui-language.js'
import { getAuthUserRole } from '../auth/user.js'

let style = Style(/* css */ `
.navbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.navbar .navbar-brand {}
.navbar .navbar-menu {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
}
.navbar .navbar-menu-toggle {
	display: flex;
	justify-content: center;
	align-items: center;
}
.navbar .navbar-menu-toggle .icon {
	width: 2rem;
	height: 2rem;
}
.navbar [name=navbar-menu-toggle] {
	display: none;
}
.navbar .navbar-menu-toggle {
	display: none;
}
.navbar .navbar-menu-item {
	border-bottom: 1px solid black;
	text-decoration: none;
	margin: 0.5rem;
	padding-bottom: 0.25rem;
	display: inline-block;
}
.navbar .navbar-menu-item.selected {
	border-bottom: 2px solid black;
	margin-bottom: calc(0.5rem - 1px)
}
@media (max-width: 768px) {
	.navbar .navbar-menu-toggle {
		display: initial;
	}
	.navbar .navbar-menu {
		display: none;
		position: fixed;
		background-color: #eee;
		inset: 0;
		margin-top: 3.5rem;
		overflow: auto;
		overscroll-behavior: contain;
		/* avoid overlap by the ws_status */
		padding-bottom: 2.5rem;
	}
	.navbar [name=navbar-menu-toggle]:checked ~ .navbar-menu {
		display: initial;
		z-index: 2;
	}
	.navbar .navbar-menu-item {
		border-bottom: none;
		display: block;
		margin-inline-start: 1rem;
		margin-block-start: 1rem;
		font-size: 1.25rem;
		width: fit-content;
	}
}
`)

function Navbar(
  attrs: { brand: Node; menuRoutes: MenuRoute[]; toggleId?: string },
  context: Context,
) {
  let currentUrl = getContextUrl(context)
  let role = getAuthUserRole(context)
  let toggleId = attrs.toggleId || 'navbar-menu-toggle'
  return (
    <nav class="navbar">
      {style}
      <div class="navbar-brand">{attrs.brand}</div>
      <label
        class="navbar-menu-toggle"
        for={toggleId}
        aria-label="toggle navigation menu"
      >
        {menuIcon}
      </label>
      <input name="navbar-menu-toggle" type="checkbox" id={toggleId} />
      <div class="navbar-menu">
        {mapArray(attrs.menuRoutes, route =>
          !isCurrentMenuRouteAllowed(route, role) ? null : (
            <a
              class={flagsToClassName({
                'navbar-menu-item': true,
                'selected': isCurrentMenuRoute(currentUrl, route),
              })}
              href={route.menuUrl || route.url}
              onclick={route.menuFullNavigate ? undefined : 'emitHref(event)'}
            >
              {route.menuText}
            </a>
          ),
        )}
        <PickLanguage style="text-align: end; margin-inline: 1rem; flex-grow: 1" />
      </div>
    </nav>
  )
}

export default Navbar
