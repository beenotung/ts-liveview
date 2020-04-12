import { attrs, c, h } from '../lib'
import { AppFunction, functions, route } from '../routes'

export function renderMenu() {
  return c(
    '#menu',
    h`<div id="menu">
${Object.entries(functions)
  .map(([name, done]) => {
    const hash = route(name as AppFunction)
    return `
<div style="display: inline-block; padding: 2px; border: 1px solid red;">
  <input type="checkbox" ${attrs({ checked: done })}>
  <a href="${hash}">${name}</a>
</div>`
  })
  .join('')}
</div>`,
  )
}
