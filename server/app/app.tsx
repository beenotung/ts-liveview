import JSX from './jsx/jsx.js'
import type { index } from '../../template/index.html'
import { loadTemplate } from '../template.js'
import express from 'express'
import type { ExpressContext, WsContext } from './context'
import type { Node } from './jsx/types'
import { nodeToHTML } from './jsx/html.js'
import { sendHTML } from './express.js'
import { getContext } from './context.js'
import { attrs } from './jsx/types'
import { Switch } from './components/router.js'
import { mapArray } from './components/list.js'
import { OnWsMessage } from '../ws/wss.js'
import { ContextSymbol } from './context'
import { dispatch } from './jsx/dispatch.js'

let template = loadTemplate<index>('index')

export function App(): Node {
  return (
    <div class="app">
      <h1>ts-liveview Demo</h1>
      <p>This page is powered by Server-Side-Rendered JSX Components</p>
      <ul id="menu">
        {mapArray(
          ['/', '/home', '/about', '/some/page/that/does-not/exist'],
          link => (
            <li>
              <a href={link} onclick="emitHref(this)">
                {link}
              </a>
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
          },
          <NotMatch />,
        )}
      </fieldset>
    </div>
  )
}

function Home() {
  return (
    <div id="home">
      <h2>Home Page</h2>
    </div>
  )
}

function About() {
  return (
    <div id="about">
      <h2>About Page</h2>
    </div>
  )
}

function NotMatch(attrs: attrs) {
  let context = getContext(attrs)
  let url = context.url
  return (
    <div id="not-match">
      <h2>404 Page Not Found</h2>
      <p>
        url: <code>{url}</code>
      </p>
    </div>
  )
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
    app: nodeToHTML([App], context),
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
  dispatch(App, context)
}
