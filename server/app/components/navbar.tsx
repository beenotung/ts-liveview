import { Context, getContextUrl } from '../context.js'
import { flagsToClassName } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { mapArray } from './fragment.js'
import { MenuRoute } from './menu.js'
import { Link } from './router.js'
import Style from './style.js'
import { menuIcon } from '../icons/menu.js'

let style = Style(/* css */ `
.navbar {
	display: flex;
	justify-content: space-between;
	align-items: end;
}
.navbar .navbar-brand {}
.navbar .navbar-menu-toggle {
	display: flex;
	justify-content: center;
	align-items: center;
}
.navbar .navbar-menu-toggle .navbar-toggle-icon {
	display: none;
	width: 3rem;
	height: 3rem;
	background: red;
}
.navbar .navbar-menu-toggle input {
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
	margin-bottom: calc(0.25rem - 1px)
}
@media (max-width: 480px) {
	.navbar .navbar-menu-toggle .navbar-toggle-icon {
		display: initial;
	}
	.navbar .navbar-menu {
		display: none;
		position: fixed;
		background-color: #eee;
		inset: 0;
		margin-top: 5rem;
	}
	.navbar input:checked ~ .navbar-menu {
		display: initial;
	}
	.navbar .navbar-menu-item {}
}
`)

function Navbar(
  attrs: { brand: Node; menuRoutes: MenuRoute[] },
  context: Context,
) {
  let currentUrl = getContextUrl(context)
  return (
    <nav class="navbar">
      {/* {menuIcon} */}
      {style}
      <div class="navbar-brand">{attrs.brand}</div>
      <label class="navbar-menu-toggle">
        {menuIcon}

        <img class="navbar-toggle-icon" src="/icons/menu.svg" />

        <svg
          class="navbar-toggle-icon"
          viewBox="0 0 512 512"
          width="512"
          height="512"
        >
          <path
            fill="none"
            stroke="white"
            stroke-width="48"
            d="M1,1 L 512,512"
          />
        </svg>

        {/* <div className="icon"> */}
        {/* <img src="https://picsum.photos/seed/1/100/100" /> */}
        {/* </div> */}
        <input name="navbar-menu-toggle" type="checkbox" />
        <div class="navbar-menu">
          {mapArray(attrs.menuRoutes, route => (
            <Link
              class={flagsToClassName({
                'navbar-menu-item': true,
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
      </label>
    </nav>
  )
}

export default Navbar
