import S from 's-js'
import { c, h } from '../lib'
import { globalSRoot } from './global'

const clock = globalSRoot.spawn(() => S.data(Date.now()))

function tick() {
  clock(Date.now())
  // setTimeout(tick, 600)
}

tick()

export function renderClock() {
  return c(
    '#clock',
    h`<div id="clock">Server Clock: ${new Date(
      clock(),
    ).toLocaleString()}</div>`,
  )
}
