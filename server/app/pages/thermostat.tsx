import { Link } from '../components/router.js'
import { Style } from '../components/style.js'
import JSX from '../jsx/jsx.js'
import { sessions } from '../session.js'
import { Update } from '../components/update.js'
import { ServerMessage } from '../../../client/index.js'

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
  let message: ServerMessage = ['update-in', '#thermostat #count', current]
  sessions.forEach(session => {
    if (session.url === '/thermostat') {
      session.ws.send(message)
    }
  })
  return <Update to="/thermostat" message={message} />
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
  index: Thermostat,
}
