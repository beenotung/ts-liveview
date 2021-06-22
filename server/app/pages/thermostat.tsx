import { Link } from '../components/router.js'
import { Style } from '../components/style.js'
import JSX from '../jsx/jsx.js'
import type { ComponentFn } from '../jsx/types'
import { Update } from '../components/update.js'
import type { attrs } from '../jsx/types'
import { getContext } from '../context.js'
import type { ManagedWebsocket } from '../../ws/wss'
import type { ServerMessage } from '../../../client/index'
import { sessionUrl, allWS } from '../session.js'
import { EarlyTerminate } from '../helpers.js'

let current = 0

export function inc() {
  current++
  return updateCount()
}

export function dec() {
  current--
  return updateCount()
}

function updateCount() {
  // wsList.forEach(ws => ws.send(['update-in', '#thermostat #count', current]))
  if ('live') {
    allWS.forEach(ws => {
      let url = sessionUrl.get(ws)
      if (url?.startsWith('/thermostat')) {
        sessionUrl.set(ws, '/thermostat')
        ws.send(['update-in', '#thermostat #count', current])
      }
    })
    throw EarlyTerminate
  }
  return (
    <Update to="/thermostat" selector="#thermostat #count" content={current} />
  )
}

export function Thermostat() {
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
