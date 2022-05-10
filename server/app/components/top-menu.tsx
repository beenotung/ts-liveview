import JSX from '../jsx/jsx.js'
import { Menu, MenuRoutes } from './menu.js'
import { pageRoutes } from '../routes.js'

let menuRoutes: MenuRoutes = pageRoutes
  .filter(route => route.menuText)
  .map(route => [route.url, route.menuText!])

export let topMenu = (
  <Menu attrs={{ style: 'margin: 1em 0' }} routes={menuRoutes} />
)
