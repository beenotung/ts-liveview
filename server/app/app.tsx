import JSX from './jsx/jsx.js'
import type { index } from '../../template/index.html'
import { loadTemplate } from '../template.js'
import express, { Response } from 'express'
import type { ExpressContext, WsContext } from './context.js'
import type { Element, Node } from './jsx/types'
import { nodeToHTML, writeNode } from './jsx/html.js'
import { sendHTMLHeader } from './express.js'
import { OnWsMessage } from '../ws/wss.js'
import { dispatchUpdate } from './jsx/dispatch.js'
import { EarlyTerminate } from './helpers.js'
import { getWSSession } from './session.js'
import DemoCookieSession from './pages/demo-cookie-session.js'
import type { ClientMessage } from '../../client/index'
import escapeHtml from 'escape-html'
import { Flush } from './components/flush.js'
import { config } from '../config.js'
import Style from './components/style.js'
import Stats from './stats.js'
import { MuteConsole } from './components/script.js'
import { matchRoute, PageRouteMatch } from './routes.js'
import { topMenu } from './components/top-menu.js'
import Chatroom from './pages/chatroom.js'
import { redirectDict } from './routes.js'
import NotMatch from './pages/not-match.js'

let template = loadTemplate<index>('index')

let scripts = config.development ? (
  <script src="/js/index.js" type="module" defer></script>
) : (
  <>
    <MuteConsole />
    <script src="/js/bundle.min.js" type="module" defer></script>
  </>
)

let style = Style(/* css */ `
h1.title {
  color: darkblue;
}
h1.title a {
  font-size: 1rem;
}
`)

export function App(main: Node): Element {
  // you can write the AST direct for more compact wire-format
  return [
    'div.app',
    {},
    [
      // or you can write in JSX for better developer-experience (if you're coming from React)
      <>
        {style}
        <h1 class="title">
          ts-liveview{' '}
          <a href="https://news.ycombinator.com/item?id=22830472">HN</a>{' '}
          <a href="https://github.com/beenotung/ts-liveview">git</a>
        </h1>
        {scripts}
        <Stats />
        {topMenu}
        <fieldset>
          <legend>Router Demo</legend>
          {main}
        </fieldset>
        <Flush />
      </>,
    ],
  ]
}

export let appRouter = express.Router()

// non-streaming routes
appRouter.use('/cookie-session/token', DemoCookieSession.tokenHandler)
appRouter.get('/chatroom', Chatroom.nicknameMiddleware)
Object.entries(redirectDict).forEach(([from, to]) =>
  appRouter.use(from, (_req, res) => res.redirect(to)),
)

// html-streaming routes
appRouter.use((req, res, next) => {
  sendHTMLHeader(res)

  let context: ExpressContext = {
    type: 'express',
    req,
    res,
    next,
    url: req.url,
  }

  let route = matchRoute(context)

  if (route.node === NotMatch) {
    res.status(404)
  }

  if (route.streaming === false) {
    responseHTML(res, context, route)
  } else {
    streamHTML(res, context, route)
  }
})

function responseHTML(
  res: Response,
  context: ExpressContext,
  route: PageRouteMatch,
) {
  let app: string
  try {
    app = nodeToHTML(App(route.node), context)
  } catch (error) {
    if (error === EarlyTerminate) {
      return
    }
    console.error('Failed to render App:', error)
    res.status(500)
    if (error instanceof Error) {
      app = 'Internal Error: ' + escapeHtml(error.message)
    } else {
      app = 'Unknown Error: ' + escapeHtml(String(error))
    }
  }

  let html = template({
    title: route.title || config.site_name,
    description: route.description || config.site_description,
    app,
  })

  res.end(html)
}

function streamHTML(
  res: Response,
  context: ExpressContext,
  route: PageRouteMatch,
) {
  let appPlaceholder = '<!-- app -->'
  let html = template({
    title: route.title || config.site_name,
    description: route.description || config.site_description,
    app: appPlaceholder,
  })
  let idx = html.indexOf(appPlaceholder)

  let beforeApp = html.slice(0, idx)
  res.write(beforeApp)
  res.flush()

  let afterApp = html.slice(idx + appPlaceholder.length)

  try {
    // send the html chunks in streaming
    writeNode(res, App(route.node), context)
  } catch (error) {
    if (error === EarlyTerminate) {
      return
    }
    console.error('Failed to render App:', error)
    if (error instanceof Error) {
      res.write('Internal Error: ' + escapeHtml(error.message))
    } else {
      res.write('Unknown Error: ' + escapeHtml(String(error)))
    }
  }

  res.write(afterApp)

  res.end()
}

export let onWsMessage: OnWsMessage<ClientMessage> = (event, ws, wss) => {
  console.log('ws message:', event)
  // TODO handle case where event[0] is not url
  let eventType: string | undefined
  let url: string
  let args: any[] | undefined
  let session = getWSSession(ws)
  if (event[0] === 'mount') {
    eventType = 'mount'
    url = event[1]
    session.locales = event[2]
    let timeZone = event[3]
    if (timeZone && timeZone !== 'null') {
      session.timeZone = timeZone
    }
    session.timezoneOffset = event[4]
  } else if (event[0][0] === '/') {
    eventType = 'route'
    url = event[0]
    args = event.slice(1)
  } else {
    console.log('unknown type of ws message:', event)
    return
  }
  session.url = url
  let context: WsContext = {
    type: 'ws',
    ws,
    url,
    args,
    event: eventType,
    session,
  }
  let route = matchRoute(context)
  let node = App(route.node)
  dispatchUpdate(context, node, route.title)
}
