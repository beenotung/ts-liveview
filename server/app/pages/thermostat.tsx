import { Link } from '../components/router.js'
import { Style } from '../components/style.js'
import { o } from '../jsx/jsx.js'
import { sessions } from '../session.js'
import { Update, UpdateIn } from '../components/update.js'
import type { ServerMessage } from '../../../client/types'
import SourceCode from '../components/source-code.js'
import { Routes, StaticPageRoute } from '../routes.js'
import type { Node } from '../jsx/types'
import { apiEndpointTitle, title } from '../../config.js'
import { Locale, isPreferZh } from '../components/locale.js'
import { Context, DynamicContext } from '../context.js'

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
  private timer: NodeJS.Timeout | null = setTimeout(this.tick)
  get status() {
    return this._status
  }
  set status(value: Status) {
    if (this._status === value) return
    this._status = value
    let messages: ServerMessage[] = [
      ['update-in', '#thermostat #status', value, this.title],
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
  get target() {
    return this._target
  }
  set target(value: number) {
    if (this._target === value) return
    this._target = value
    update(['update-in', '#thermostat #target', value.toFixed(1), this.title])
    if (!this.timer) {
      this.timer = setTimeout(this.tick)
    }
  }
  get current() {
    return this._current
  }
  set current(value: number) {
    if (this._current === value) return
    this._current = value
    update(['update-in', '#thermostat #current', value.toFixed(1), this.title])
  }
  get targetText() {
    return this.target.toFixed(1) + '°'
  }
  get currentText() {
    return this.current.toFixed(1) + '°'
  }
  get title() {
    return title(`C: ${this.currentText} | T: ${this.targetText} | Thermostat`)
  }
}
const state = new State()

function inc() {
  state.target += 0.5
  return (
    <UpdateIn
      to="/thermostat"
      selector="#thermostat #target"
      content={state.target.toFixed(1)}
      title={state.title}
    />
  )
}

function dec() {
  state.target -= 0.5
  return (
    <UpdateIn
      to="/thermostat"
      selector="#thermostat #target"
      content={state.target.toFixed(1)}
      title={state.title}
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

/* the root node is statically built at boot-time (doesn't need to be reconstructed at request-time) */
let Thermostat: Node = (
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
    <h1>
      <Locale en="Thermostat Demo" zh="溫控器範例" />
    </h1>
    <p>
      <Locale
        en="This demo illustrates how to do cross-browser realtime update."
        zh="此範例展示了如何實現跨瀏覽器的即時更新。"
      />
    </p>
    <p>
      <Locale
        en="The state is globally shared (for all connections) and the logic is maintained on the server."
        zh="狀態在所有連線中是全域共享的，邏輯由伺服器維護。"
      />
    </p>
    <p>
      <Locale
        en="In addition, the document title is dynamically generated and updated in realtime."
        zh="此外，文件標題是動態生成並即時更新的。"
      />
    </p>
    <h2 class="title">
      <Locale en="Interactive UIs" zh="互動式介面" />
    </h2>
    <div class="outer circle" style={StatusStyles[state.status]}>
      <div class="text-container">
        <Locale en="Target:" zh="目標溫度：" />
        &nbsp;
        <span
          title={
            <Locale
              en="Target temperature in celsius degree"
              zh="攝氏目標溫度"
            />
          }
        >
          <span id="target">
            {
              /* this fraction is wrapped in an inline functional component to evaluate the state at request-time */
              [() => state.target.toFixed(1)]
            }
          </span>
          &deg;
        </span>
      </div>
      <div>
        <div class="middle circle">
          <div>
            <Link
              href="/thermostat/dec"
              no-history
              title={
                <Locale
                  en="Reduce target temperature by 0.5 celsius degree"
                  zh="降低目標溫度0.5攝氏度"
                />
              }
            >
              <button>-</button>
            </Link>
          </div>
          <div>
            <div class="inner circle">
              <span
                title={
                  <Locale
                    en="Current temperature in celsius degree"
                    zh="當前攝氏溫度"
                  />
                }
              >
                <span id="current">{[() => state.current.toFixed(1)]}</span>
                &deg;
              </span>
            </div>
          </div>
          <div>
            <Link
              href="/thermostat/inc"
              no-history
              title={
                <Locale
                  en="Increase target temperature by 0.5 celsius degree"
                  zh="增加目標溫度0.5攝氏度"
                />
              }
            >
              <button>+</button>
            </Link>
          </div>
        </div>
      </div>
      <div class="text-container">
        <span id="status" title={<Locale en="Current status" zh="當前狀態" />}>
          {[() => state.status]}
        </span>
      </div>
    </div>
    <SourceCode page="thermostat.tsx" />
    <p>
      <a href="https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript">
        <Locale en="Layout reference" zh="界面參考" />
      </a>
    </p>
  </div>
)

function index(context: Context): StaticPageRoute {
  let zh = isPreferZh(context)
  return {
    title: zh ? '溫控器範例' : 'Thermostat Demo',
    description: zh
      ? `一個即時更新的溫控器範例應用程式。當前溫度：${state.currentText}；目標溫度：${state.targetText}。`
      : `A real-time updated thermostat demo application. Current temperature: ${state.currentText}; target temperature: ${state.targetText}.`,
    node: Thermostat,
  }
}

let routes = {
  '/thermostat': {
    menuText: <Locale en="Thermostat" zh="溫控器" />,
    resolve: index,
  },
  '/thermostat/inc': {
    title: apiEndpointTitle,
    description: 'increase target temperature of the demo thermostat',
    node: [inc],
    streaming: false,
  },
  '/thermostat/dec': {
    title: apiEndpointTitle,
    description: 'decrease target temperature of the demo thermostat',
    node: [dec],
    streaming: false,
  },
} satisfies Routes

export default { routes }
