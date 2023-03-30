import { o } from '../jsx/jsx.js'
import { menuRoutes } from '../routes.js'
import { Menu } from './menu.js'

export let topMenu = (
  <Menu attrs={{ style: 'margin: 1em 0' }} routes={menuRoutes} />
)
