import { Link } from '../components/router.js'
import { Style } from '../components/style.js'
import JSX from '../jsx/jsx.js'
import { sessions } from '../session.js'
import { Update, UpdateIn } from '../components/update.js'
import type { ServerMessage } from '../../../client'

const UpdateInterval = 1000
type Status = 'cooling' | 'heating' | 'idle'
class State {
  private _current = 27
  private _target = 25.5
  private _status: Status = 'idle'
  get current() {
    return this._current
  }
  get target() {
    return this._target
  }
  get status() {
    return this._status
  }
  private tick = () => {
    if (this.current === this.target) {
      this.status = 'idle'
      this.timer = null
      return
    }
    if (this.current > this.target) {
      this.status = 'cooling'
      this.current -= 0.5
    } else if (this.current < this.target) {
      this.status = 'heating'
      this.current += 0.5
    }
    this.timer = setTimeout(this.tick, UpdateInterval)
  }
  private timer: any = setTimeout(this.tick)
  set status(value: Status) {
    if (this._status === value) return
    this._status = value
    update(['update-in', '#thermostat #status', value])
  }
  set target(value: number) {
    if (this._target === value) return
    this._target = value
    update(['update-in', '#thermostat #target', value.toFixed(1)])
    if (!this.timer) {
      this.timer = setTimeout(this.tick)
    }
  }
  set current(value: number) {
    if (this._current === value) return
    this._current = value
    update(['update-in', '#thermostat #current', value.toFixed(1)])
  }
}
const state = new State()

export function inc() {
  state.target += 0.5
  return (
    <UpdateIn
      to="/thermostat"
      selector="#thermostat #target"
      content={state.target.toFixed(1)}
    />
  )
}

export function dec() {
  state.target -= 0.5
  return (
    <UpdateIn
      to="/thermostat"
      selector="#thermostat #target"
      content={state.target.toFixed(1)}
    />
  )
}

function update(message: ServerMessage) {
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
        #thermostat label {
            display: block;
            text-transform: capitalize;
            margin-top: 0.5em;
            margin-bottom: 0.25em;
            font-weight: bold;
        }
        #thermostat label::after {
            content: ":";
        }
        `)}
      <label for="status">status</label>
      <span id="status">{state.status}</span>
      <label for="current">current</label>
      <span id="current">{state.current}</span>
      <label for="target">target</label>
      <Link href="/thermostat/dec" no-history>
        <button>-</button>
      </Link>
      <span id="target">{state.target}</span>
      <Link href="/thermostat/inc" no-history>
        <button>+</button>
      </Link>
    </div>
  )
}

export default {
  inc,
  dec,
  index: Thermostat,
}
