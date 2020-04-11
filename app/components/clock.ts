import S from 's-js'
import { c, h } from '../lib'

const now = S.data(Date.now())
setInterval(() => now(Date.now()), 1000)

export function renderClock() {
  return c(
    '#clock',
    h`<div id="clock">
Now is: ${new Date(now()).toLocaleString()}
</div>`,
  )
}
