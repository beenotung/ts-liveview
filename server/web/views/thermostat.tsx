import type { Router } from 'url-router.ts'
import JSX from '../../../client/jsx.js'
import { Style } from '../../components/style.js'
import { ContextHandler } from '../context.js'
import { sendVElement } from '../helpers/response.js'
import { Context } from '../context'

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

function onUpdateCurrent(context: Context) {
  context.type === 'express'
    ? context.res.redirect('/thermostat')
    : context.ws.send(['update', ['#thermostat .current', {}, [current]]])
}

export default function (router: Router<ContextHandler>) {
  router.add('/thermostat', context => {
    sendVElement(context, render())
  })
  router.add('/thermostat/inc', context => {
    current++
    onUpdateCurrent(context)
  })
  router.add('/thermostat/dec', context => {
    current--
    onUpdateCurrent(context)
  })
}
