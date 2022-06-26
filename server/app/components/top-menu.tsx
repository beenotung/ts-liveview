import { o } from '../jsx/jsx.js'
import { menuRoutes } from '../routes.js'
import { Menu, MenuRoutes } from './menu.js'

let routes: MenuRoutes = menuRoutes.map(route => [
  route.menuUrl,
  route.menuText,
  route.url,
])

routes.push(['/some/page/that/does-not/exist', 'some page that does not exist'])

export let topMenu = <Menu attrs={{ style: 'margin: 1em 0' }} routes={routes} />
