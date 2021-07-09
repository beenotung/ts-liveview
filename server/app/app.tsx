import JSX from './jsx/jsx.js'
import type { index } from '../../template/index.html'
import { loadTemplate } from '../template.js'
import express from 'express'
import { getContextUrl } from './context.js'
import type { ExpressContext, WsContext } from './context.js'
import type { attrs, Element } from './jsx/types'
import { flagsToClassName, nodeToHTML } from './jsx/html.js'
import { sendHTML } from './express.js'
import { Redirect, Switch } from './components/router.js'
import { mapArray } from './components/fragment.js'
import { OnWsMessage } from '../ws/wss.js'
import { dispatchUpdate } from './jsx/dispatch.js'
import { Link } from './components/router.js'
import { Style } from './components/style.js'
import { EarlyTerminate } from './helpers.js'
import { setSessionUrl } from './session.js'
import { capitalize } from './string.js'
import NotMatch from './pages/not-match.js'
import Home from './pages/home.js'
import About, { License } from './pages/about.js'
import Thermostat from './pages/thermostat.js'
import Editor from './pages/editor.js'
import AutoCompleteDemo from './pages/auto-complete-demo.js'
import DemoForm from './pages/demo-form.js'
import DemoCookieSession from './pages/demo-cookie-session.js'

let template = loadTemplate<index>('index')

export function Menu(attrs: attrs) {
  let url = getContextUrl(attrs)
  return (
    <>
      {Style(`
        #menu > a {
          margin: 0.25em;
          text-decoration: none;
          border-bottom: 1px solid black;
        }
        #menu > a.selected {
          border-bottom: 2px solid black;
        }
    `)}
      <div id="menu">
        {mapArray(
          [
            '/',
            '/home',
            '/about',
            '/thermostat',
            '/editor',
            '/auto-complete',
            '/form',
            '/cookie-session',
            '/some/page/that/does-not/exist',
          ],
          link => {
            let text = link.substr(1)
            if (!text.includes('/')) {
              text = text.split('-').map(capitalize).join('-')
            }
            return (
              <Link
                href={link}
                class={flagsToClassName({
                  selected:
                    url.startsWith(link) || (url === '/' && link === '/home'),
                })}
              >
                {text}
              </Link>
            )
          },
        )}
      </div>
    </>
  )
}

export function App(): Element {
  // you can write the AST direct for more compact wire-format
  return [
    'div.app',
    {},
    [
      // or you can write in JSX for better developer-experience (if you're coming from React)
      <>
        <h1>ts-liveview Demo</h1>
        <p>This page is powered by Server-Side-Rendered JSX Components</p>
        <Menu />

        <fieldset>
          <legend>Router Demo</legend>
          {Switch(
            {
              // jsx node can be used directly
              '/': Home,
              '/home': Home,
              '/about': About,
              '/about/:mode': About,
              // invoke functional component with square bracket
              '/thermostat': [Thermostat.index],
              '/thermostat/inc': [Thermostat.inc],
              '/thermostat/dec': [Thermostat.dec],
              // or invoke functional component with x-html tag
              '/editor': <Editor />,
              '/auto-complete': <AutoCompleteDemo />,
              '/form': <DemoForm.index />,
              '/form/submit': <DemoForm.submit />,
              '/form/live/:key': <DemoForm.set />,
              '/cookie-session': <DemoCookieSession.index />,
              '/cookie-session/token': <DemoCookieSession.Token />,
              // patch routes for links in README.md
              '/LICENSE': License,
              '/server/app/pages/thermostat.tsx': (
                <Redirect href="/thermostat" />
              ),
              '/server/app/pages/editor.tsx': <Redirect href="/editor" />,
              '/server/app/pages/auto-complete-demo.tsx': (
                <Redirect href="/auto-complete" />
              ),
              '/server/app/pages/demo-form.tsx': <Redirect href="/form" />,
              '/server/app/pages/home.tsx': <Redirect href="/home" />,
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
  let app: string
  let description = 'TODO'
  try {
    app = nodeToHTML(<App />, context)
  } catch (error) {
    if (error === EarlyTerminate) {
      return
    }
    console.error('Failed to render App:', error)
    res.status(500)
    if (error instanceof Error) {
      app = 'Internal Error: ' + error.message
    } else {
      app = 'Unknown Error'
    }
  }
  let page = capitalize(req.url.split('/')[1] || 'Home Page')
  let html = template({
    title: `${page} - LiveView Demo`,
    description,
    app,
  })
  sendHTML(res, html)
})

export let onWsMessage: OnWsMessage = (event, ws, wss) => {
  console.log('ws message:', event)
  // TODO handle case where event[0] is not url
  let url: string
  let args: any[] | undefined
  let eventType: string | undefined
  if (event[0] === 'mount') {
    url = event[1]
    eventType = 'mount'
  } else if (event[0][0] === '/') {
    url = event[0]
    args = event.slice(1)
    eventType = 'route'
  } else {
    console.log('unknown type of ws message:', event)
    return
  }
  let context: WsContext = {
    type: 'ws',
    ws,
    wss,
    url,
    args,
    event: eventType,
  }
  setSessionUrl(ws, url)
  dispatchUpdate(<App />, context)
}
