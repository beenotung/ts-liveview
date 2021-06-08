import JSX from './jsx/jsx.js'
import type { index } from '../../template/index.html'
import { loadTemplate } from '../template.js'
import express from 'express'
import type { ExpressContext, WsContext } from './context'
import type { ComponentFn, Element } from './jsx/types'
import { nodeToHTML } from './jsx/html.js'
import { sendHTML } from './express.js'
import { Switch } from './components/router.js'
import { mapArray } from './components/fragment.js'
import { OnWsMessage } from '../ws/wss.js'
import { dispatchUpdate } from './jsx/dispatch.js'
import { Home } from './pages/home.js'
import { About } from './pages/about.js'
import { NotMatch } from './pages/not-match.js'
import { Link } from './components/router.js'
import { Thermostat } from './pages/thermostat.js'

let template = loadTemplate<index>('index')

export function App(): Element {
  return [
    'div.app',
    {},
    [
      <>
        <h1>ts-liveview Demo</h1>
        <p>This page is powered by Server-Side-Rendered JSX Components</p>
        <ul id="menu">
          {mapArray(
            [
              '/',
              '/home',
              '/about',
              '/some/page/that/does-not/exist',
              '/thermostat',
            ],
            link => (
              <li>
                <Link href={link}>{link}</Link>
              </li>
            ),
          )}
        </ul>
        <fieldset>
          <legend>Router Demo</legend>
          {Switch(
            {
              '/': [Home],
              '/home': [Home],
              '/about': [About],
              '/thermostat': [Thermostat as ComponentFn],
              '/thermostat/:cmd': [Thermostat as ComponentFn],
            },
            <NotMatch />,
          )}
        </fieldset>
      </>,
    ],
  ]
}

export let expressRouter = express.Router()
expressRouter.use((req, res, next) => {
  let context: ExpressContext = {
    type: 'express',
    req,
    res,
    next,
    url: req.url,
  }
  let html = template({
    title: 'TODO',
    description: 'TODO',
    app: nodeToHTML(<App />, context),
  })
  sendHTML(res, html)
})

export let onWsMessage: OnWsMessage = (event, ws, wss) => {
  console.log('ws message:', event)
  let [url, ...args] = event
  let context: WsContext = {
    type: 'ws',
    ws,
    wss,
    url,
    args,
  }
  dispatchUpdate(<App />, context)
}
