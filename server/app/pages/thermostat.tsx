import { Link } from '../components/router.js'
import { Style } from '../components/style.js'
import JSX from '../jsx/jsx.js'
import type { ComponentFn } from '../jsx/types'
import { Update } from '../components/update.js'
import type { attrs } from '../jsx/types'
import { getContext } from '../context.js'
import type { ManagedWebsocket } from '../../ws/wss'
import type { ServerMessage } from '../../../client/index'

let current = 0

export function inc() {
  current++
  return updateCount()
}

export function dec() {
  current--
  return updateCount()
}

// TODO find a better way to get list of related client
let wsList: ManagedWebsocket<ServerMessage>[] = []
function updateCount() {
  wsList.forEach(ws => ws.send(['update-in', '#thermostat #count', current]))
  return (
    <Update to="/thermostat" selector="#thermostat #count" content={current} />
  )
}

export function Thermostat(attrs: attrs) {
  let context = getContext(attrs)
  if (context.type === 'ws') {
    const ws = context.ws
    wsList.push(ws)
    ws.ws.once('close', () => wsList.splice(wsList.indexOf(ws)))
  }
  return (
    <div id="thermostat">
      {Style(`
        #thermostat button {
            margin: 0.25em;
            font-size: larger;
        }
        #thermostat [data-live=redirect] {
            display: block;
        }
        `)}
      <Link href="/thermostat/inc" no-history>
        <button>+</button>
      </Link>
      <span id="count">{current}</span>
      <Link href="/thermostat/dec" no-history>
        <button>-</button>
      </Link>
    </div>
  )
}

export default {
  inc,
  dec,
  index: Thermostat as ComponentFn,
}
