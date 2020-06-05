import { c, h } from '../lib'

export function render404Page(hash: string) {
  return c(
    '#404',
    h`<div id="404">
<h2>404 Page Not Found</h2>
<p>
The router doesn't recognize hash <code>${hash}</code>
</p>
</div>`,
  )
}
