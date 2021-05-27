import type { Router } from 'url-router.ts'
import JSX from '../../../client/jsx.js'
import { Style } from '../../components.js'
import { ManagedWebsocket } from '../../wss.js'
import { ContextHandler } from '../context.js'
import { sendVElement, updateVElement } from '../helpers/response.js'

let current = 0

function render() {
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
      <h2>Thermostat</h2>
      <a href="/">Home</a>
      <div>
        <a href="/thermostat/inc" onclick="emitHref(this)">
          <button>+</button>
        </a>
        <span class="current">{current}</span>
        <a href="/thermostat/dec" onclick="emitHref(this)">
          <button>-</button>
        </a>
      </div>
    </div>
  )
}
function updateCurrent(ws: ManagedWebsocket) {
  updateVElement(ws, ['#thermostat .current', void 0, [current]])
}

export default function (router: Router<ContextHandler>) {
  router.add('/thermostat', context => {
    sendVElement(context, render())
  })
  router.add('/thermostat/inc', context => {
    current++
    context.type === 'express'
      ? context.res.redirect('/thermostat')
      : updateCurrent(context.ws)
  })
  router.add('/thermostat/dec', context => {
    current--
    context.type === 'express'
      ? context.res.redirect('/thermostat')
      : updateCurrent(context.ws)
  })
}
