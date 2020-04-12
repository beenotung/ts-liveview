import { c, h } from '../lib'

export function renderServicePage(p: { shopId: string; serviceId: string }) {
  const shopId = p.shopId
  return c(
    '#shop',
    h`<div id="shops">
<h2>Service Page</h2>
<pre>
shop id: ${shopId}
service id: ${p.serviceId}
</pre>
</div>`,
  )
}
