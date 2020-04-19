import { c, h, table } from '../../src'
import {
  live_session_counter,
  session_counter,
  visitor_counter,
} from '../state/visitor'

export function renderStats() {
  return c(
    '#stats',
    h`<div id="stats">
${table([
  ['#visitor', visitor_counter().toLocaleString()],
  ['#session', session_counter().toLocaleString()],
  ['#live-session', live_session_counter().toLocaleString()],
])}
</div>`,
  )
}
