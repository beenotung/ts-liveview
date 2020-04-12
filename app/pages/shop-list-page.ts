import { c, h } from '../lib'
import { routes } from '../routes'

export function renderShopListPage() {
  return c(
    '#shop',
    h`<div id="shops">
<h2>Shop List</h2>
<a href="#${routes.shop.stringify({ shopId: 1 })}" ">Shop 1</a>
<a href="#${routes.shop.stringify({ shopId: 2 })}" ">Shop 2</a>
</div>`,
  )
}
