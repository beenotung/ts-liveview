import { Link } from '../components/router.js'
import { Style } from '../components/style.js'
import JSX from '../jsx/jsx.js'
import { sessions } from '../session.js'
import { Update, UpdateIn } from '../components/update.js'
import type { ServerMessage } from '../../../client'

const UpdateInterval = 1000

type Status = 'cooling' | 'heating' | 'idle'

const StatusStyles: Record<Status, string> = {
  heating: `
background: #f83;
background: linear-gradient(180deg, #f83 0%, #f54 100%);
color: white;
`.replace(/\n/g, ' '),
  cooling: `
background: #6ae;
background: linear-gradient(180deg, #6ae 0%, #17d 100%);
color: white;
`.replace(/\n/g, ' '),
  idle: `
background: #eef;
background: radial-gradient(#fff 0%, #eef 100%);
color: black;
`.replace(/\n/g, ' '),
}

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
    let messages: ServerMessage[] = [
      ['update-in', '#thermostat #status', value],
      [
        'update-attrs',
        '#thermostat .outer.circle',
        {
          style: StatusStyles[value],
        },
      ],
    ]
    update(['batch', messages])
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
      {Style(/* css */ `
        #thermostat button {
            margin: 0.25em;
            font-size: larger;
        }
        #thermostat [data-live=redirect] {
            display: block;
        }
        #thermostat .title {
          width: min(72vw,72vh);
          text-align: center;
        }
        #thermostat .circle.outer {
          --size: min(72vw,72vh);
          background-color: #eef;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        #thermostat .circle.outer > div {
          display: flex;
          flex-direction: row;
          justify-content: center;
        }
        #thermostat .circle.outer > .text-container {
          font-size: 1.25em;
          padding: min(3vw,3vh);
        }
        #thermostat .circle.middle {
          --size: min(48vw,48vh);
          display: flex;
          flex-direction: row;
          justify-content: center;
          background-color: #eee;
          color: black;
        }
        #thermostat .circle.middle > div {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        #thermostat .circle.middle button {
          border: none;
          width: min(12vw,12vh);
          height: min(12vw,12vh);
          margin: 0;
          background-color: transparent;
          font-size: 2em;
          cursor: pointer;
        }
        #thermostat .circle.middle button:hover {
          outline: 1px solid gray;
        }
        #thermostat .circle.inner {
         --size: min(24vw,24vh);
          background-color: white;
          display: flex;
          flex-direction: column;
          text-align: center;
          justify-content: center;
          font-size: 1.6em;
        }
        #thermostat .circle {
          border-radius: 100%;
          border: 1px solid black;
          width: var(--size);
          height: var(--size);
        }
        `)}
      <h2>Thermostat Demo</h2>
      <p>This demo illustrates how to do cross-browser realtime update.</p>
      <p>
        The state is globally shared (for all connections) and the logic are
        maintained on the server.
      </p>
      <h3 class="title">Interactive UIs</h3>
      <div class="outer circle" style={StatusStyles[state.status]}>
        <div class="text-container">
          Target:&nbsp;
          <span title="Target temperature in celsius degree">
            <span id="target">{state.target.toFixed(1)}</span>&deg;
          </span>
        </div>
        <div>
          <div class="middle circle">
            <div>
              <Link
                href="/thermostat/dec"
                no-history
                title="Reduce target temperature by 0.5 celsius degree"
              >
                <button>-</button>
              </Link>
            </div>
            <div>
              <div class="inner circle">
                <span title="Current temperature in celsius degree">
                  <span id="current">{state.current.toFixed(1)}</span>&deg;
                </span>
              </div>
            </div>
            <div>
              <Link
                href="/thermostat/inc"
                no-history
                title="Increase target temperature by 0.5 celsius degree"
              >
                <button>+</button>
              </Link>
            </div>
          </div>
        </div>
        <div class="text-container">
          <span id="status" title="Current status">
            {state.status}
          </span>
        </div>
      </div>
      <p>
        <a href="https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript">
          Layout reference
        </a>
      </p>
    </div>
  )
}

export default {
  inc,
  dec,
  index: Thermostat,
}
