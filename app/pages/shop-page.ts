import { c, h } from '../lib'
import { routes } from '../routes'

export function renderShopPage(p: { shopId: string }) {
  const shopId = p.shopId
  return c(
    '#shop',
    h`<div id="shops">
<h2>Service List of Shop ${shopId}</h2>
<a href="#${routes.service.stringify({ shopId, serviceId: 1 })}" ">Service 1</a>
<a href="#${routes.service.stringify({ shopId, serviceId: 2 })}" ">Service 2</a>
</div>`,
  )
}
