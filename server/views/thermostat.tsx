import JSX from '../../client/jsx.js'
import { Style } from '../components/style.js'
import { ManagedWebsocket } from '../ws/wss.js'
import type { OnMessages, View } from './view'

let count = 0

function render() {
  console.log('render', { count })
  return (
    <div id="thermostat">
      <Style
        css={`
          #thermostat button {
            margin: 0.25em;
            font-size: larger;
          }
        `}
      />
      <a href="/thermostat/inc" onclick="emit('inc')">
        <button>+</button>
      </a>
      <span id="count">{count}</span>
      <a href="/thermostat/dec" onclick="emit('dec')">
        <button>-</button>
      </a>
    </div>
  )
}

let onMessages = {
  inc(_?: any, ws?: ManagedWebsocket) {
    count++
    ws?.send(['update', ['#thermostat #count', [], [count]]])
  },
  dec(_?: any, ws?: ManagedWebsocket) {
    count--
    ws?.send(['update', ['#thermostat #count', [], [count]]])
  },
}

export let thermostatView = {
  render,
  onMessages,
}
