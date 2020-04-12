import { attrs, c, h, table } from '../lib'

const functions = {
  Home: true,
  Booking: true,
  Page3: false,
  Page4: false,
}
export type AppFunction = keyof typeof functions

const route = (name: AppFunction) => '#/' + name.toLowerCase()

export function renderMenu() {
  return c(
    '#menu',
    h`<div id="menu">
${table(
  Object.entries(functions).map(([name, done]) => {
    const hash = route(name as AppFunction)
    return [
      `<input type="checkbox" ${attrs({ checked: done })}>`,
      `<a href="${hash}">${name}</a>`,
    ]
  }),
)}
</div>`,
  )
}
