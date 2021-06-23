import { Link } from '../components/router.js'
import { Style } from '../components/style.js'
import JSX from '../jsx/jsx.js'
import type { ComponentFn } from '../jsx/types'
import { sessions } from '../session.js'
import { UpdateIn } from '../components/update.js'

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
  sessions.forEach(session => {
    if (session.url === '/thermostat') {
      session.ws.send(['update-in', '#thermostat #count', current])
      session.url = '/thermostat'
    }
  })
  return (
    <UpdateIn
      to="/thermostat"
      selector="#thermostat #count"
      content={current}
    />
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
