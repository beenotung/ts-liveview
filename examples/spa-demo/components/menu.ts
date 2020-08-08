import { attrs, c, h } from '../lib'
import { AppFunction, functions, route } from '../routes'

export function renderMenu() {
  return c(
    '#menu',
    h`<div id="menu">
<h2>Dynamic Page Menu</h2>
${Object.entries(functions)
  .map(([name, done]) => {
    const hash = route(name as AppFunction)
    return `
<div style="display: inline-block; padding: 2px;">
  <input type="checkbox" ${attrs({ checked: done })} name="${name}" disabled>
  <a href="${hash}">${name}</a>
</div>`
  })
  .join('')}
</div>`,
  )
}
