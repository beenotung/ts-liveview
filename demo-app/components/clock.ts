import S from 's-js'
import { c, h } from '../lib'

const now = S.data(Date.now())
setInterval(() => now(Date.now()), 1000)

export function renderClock() {
  return c(
    '#clock',
    h`<div id="clock">
<h2>Realtime Clock</h2>
The clock on server is:
<div>
${new Date(now()).toString()}
</div>
</div>`,
  )
}
