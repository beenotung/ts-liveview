import { o } from './jsx/jsx.js'
import { scanTemplateDir } from '../template-file.js'
import { NextFunction, Request, Response, Router } from 'express'
import type { Context, ExpressContext, WsContext } from './context'
import { fixLanguage } from './context.js'
import type { Element } from './jsx/types'
import {
  escapeHTMLAttributeValue,
  escapeHTMLTextContent,
  unquote,
  writeNode,
} from './jsx/html.js'
import { sendHTMLHeader } from './express.js'
import { OnWsMessage } from '../ws/wss.js'
import { dispatchUpdate } from './jsx/dispatch.js'
import { EarlyTerminate, MessageException } from '../exception.js'
import { getWSSession } from './session.js'
import { Flush } from './components/flush.js'
import { LayoutType, config } from '../config.js'
import Stats from './components/stats.js'
import { MuteConsole, Script } from './components/script.js'
import {
  matchRoute,
  menuRoutes,
  PageRouteMatch,
  redirectDict,
} from './routes.js'
import type { ClientMountMessage, ClientRouteMessage } from '../../client/types'
import { then } from '@beenotung/tslib/result.js'
import { webAppStyle, ionicAppStyle } from './app-style.js'
import { preIonicAppScript, postIonicAppScript } from './styles/mobile-style.js'
import { renderWebTemplate } from '../../template/web.js'
import { renderIonicTemplate } from '../../template/ionic.js'
import { HTMLStream } from './jsx/stream.js'
import { renewAuthCookieMiddleware } from './auth/user.js'
import { getWsCookies } from './cookie.js'
import Navbar from './components/navbar.js'
import Sidebar from './components/sidebar.js'
import Profile from './pages/profile.js'
import { logRequest } from './log.js'
import { WindowStub } from '../../client/internal.js'
import { updateRequestSession } from '../../db/request-log.js'
import { Link } from './components/router.js'
import verificationCode from './pages/verification-code.js'

if (config.development) {
  scanTemplateDir('template')
}
function renderTemplate(
  stream: HTMLStream,
  context: Context,
  route: PageRouteMatch,
) {
  let layout_type = route.layout_type || config.layout_type
  let App = layouts[layout_type]
  let app = App(route)
  let render =
    route.renderTemplate ||
    (App == IonicApp ? renderIonicTemplate : renderWebTemplate)
  render(stream, {
    title: escapeHTMLTextContent(route.title),
    description: unquote(escapeHTMLAttributeValue(route.description)),
    app:
      typeof app == 'string' ? app : stream => writeNode(stream, app, context),
  })
}

function CurrentNavigationMetaData(attrs: {}, context: Context) {
  let js = `_navigation_type_="${context.type}";`
  if (context.type == 'express') {
    js += `_navigation_method_="${context.req.method}";`
  }
  return Script(js)
}

let scripts = config.development ? (
  <>
    <CurrentNavigationMetaData />
    <script src="/js/index.js" type="module" defer></script>
  </>
) : (
  <>
    {MuteConsole}
    <CurrentNavigationMetaData />
    <script src="/js/bundle.min.js" type="module" defer></script>
  </>
)

let brand = (
  <div style="color: darkblue; font-weight: bold">
    <Link
      style="font-size: 1.7rem; text-decoration: none"
      class="text-no-wrap"
      href="/"
    >
      {config.site_name}
    </Link>{' '}
    <div class="text-no-wrap">
      <a target="_blank" href="https://hn.algolia.com/?query=ts-liveview">
        HN
      </a>{' '}
      <a target="_blank" href="https://github.com/beenotung/ts-liveview">
        git
      </a>
    </div>
  </div>
)

type Layout = (route: PageRouteMatch) => Element

let layouts: Record<LayoutType, Layout> = {
  [LayoutType.navbar]: NavbarApp,
  [LayoutType.sidebar]: SidebarApp,
  [LayoutType.ionic]: IonicApp,
}

function NavbarApp(route: PageRouteMatch): Element {
  // you can write the AST direct for more compact wire-format
  return [
    'div.app',
    {},
    [
      // or you can write in JSX for better developer-experience (if you're coming from React)
      <>
        {webAppStyle}
        <Flush />
        <Navbar brand={brand} menuRoutes={menuRoutes} />
        <hr />
        {scripts}
        {route.node}
        <Flush />
        <Footer />
      </>,
    ],
  ]
}

function SidebarApp(route: PageRouteMatch): Element {
  // you can write the AST direct for more compact wire-format
  return [
    'div.app',
    {},
    [
      // or you can write in JSX for better developer-experience (if you're coming from React)
      <>
        {webAppStyle}
        {scripts}
        {Sidebar.style}
        <Flush />
        <div class={Sidebar.containerClass}>
          <Sidebar brand={brand} menuRoutes={menuRoutes} />
          <div
            class={Sidebar.mainContainerClass}
            style="display: flex; flex-direction: column"
          >
            <div style="flex-grow: 1; padding: 0 1rem">{route.node}</div>
            <Footer style="padding: 0.5rem;" />
          </div>
        </div>
        <Flush />
      </>,
    ],
  ]
}

function IonicApp(route: PageRouteMatch): Element {
  // you can write the AST direct for more compact wire-format
  return [
    'div.app',
    {},
    [
      // or you can write in JSX for better developer-experience (if you're coming from React)
      <>
        {ionicAppStyle}
        {scripts}
        {preIonicAppScript}
        <Flush />
        <ion-app>{route.node}</ion-app>
        {postIonicAppScript}
        <Flush />
      </>,
    ],
  ]
}

function Footer(attrs: { style?: string }) {
  return (
    <footer
      style={
        'border-top: 1px solid #aaa; padding-top: 0.5rem; margin-top: 0.5rem;' +
        (attrs.style || '')
      }
    >
      <div style="margin-bottom: 0.75rem">
        Made with 💝 by{' '}
        <a target="_blank" href="https://github.com/beenotung">
          Beeno
        </a>
      </div>
      <Stats />
    </footer>
  )
}

// prefer flat router over nested router for less overhead
export function attachRoutes(app: Router) {
  // ajax/upload/middleware routes
  app.use(renewAuthCookieMiddleware)
  Profile.attachRoutes(app)

  // redirect routes
  Object.entries(redirectDict).forEach(([from, to]) =>
    app.use(from, (_req, res) => res.redirect(to)),
  )

  // liveview routes
  app.use(handleLiveView)
}

async function handleLiveView(req: Request, res: Response, next: NextFunction) {
  sendHTMLHeader(res)

  let context: ExpressContext = {
    type: 'express',
    req,
    res,
    next,
    url: req.url,
  }

  try {
    await then(
      matchRoute(context),
      route => {
        if (route.status) {
          res.status(route.status)
        }

        route.description = route.description.replace(/"/g, "'")

        if (route.streaming === false) {
          responseHTML(res, context, route)
        } else {
          streamHTML(res, context, route)
        }
      },
      onError,
    )
  } catch (error) {
    onError(error)
  }
  function onError(error: unknown) {
    if (error == EarlyTerminate) {
      return
    }
    if (error instanceof MessageException) {
      res.json({ message: error.message })
      return
    }
    res.status(500)
    res.json({ error: String(error) })
    console.error(error)
  }
}

function responseHTML(
  res: Response,
  context: ExpressContext,
  route: PageRouteMatch,
) {
  let html = ''
  let stream = {
    write(chunk: string) {
      html += chunk
    },
    flush() {},
  }

  try {
    renderTemplate(stream, context, route)
  } catch (error) {
    if (error === EarlyTerminate) {
      return
    }
    console.error('Failed to render App:', error)
    if (!res.headersSent) {
      res.status(500)
    }
    html +=
      error instanceof Error
        ? 'Internal Error: ' + escapeHTMLTextContent(error.message)
        : 'Unknown Error: ' + escapeHTMLTextContent(String(error))
  }

  // deepcode ignore XSS: the dynamic content is html-escaped
  res.end(html)
}

function streamHTML(
  res: Response,
  context: ExpressContext,
  route: PageRouteMatch,
) {
  try {
    renderTemplate(res, context, route)
    res.end()
  } catch (error) {
    if (error === EarlyTerminate) {
      return
    }
    console.error('Failed to render App:', error)
    if (!res.headersSent) {
      res.status(500)
    }
    // deepcode ignore XSS: the dynamic content is html-escaped
    res.end(
      error instanceof Error
        ? 'Internal Error: ' + escapeHTMLTextContent(error.message)
        : 'Unknown Error: ' + escapeHTMLTextContent(String(error)),
    )
  }
}

export let onWsMessage: OnWsMessage = async (event, ws, _wss) => {
  console.log('ws message:', event)
  // TODO handle case where event[0] is not url
  let eventType: string | undefined
  let url: string
  let args: unknown[] | undefined
  let session = getWSSession(ws)
  let navigation_type: WindowStub['_navigation_type_']
  let navigation_method: WindowStub['_navigation_method_']
  if (event[0] === 'mount') {
    event = event as ClientMountMessage
    eventType = 'mount'
    url = event[1]
    session.language = fixLanguage(event[2])
    let timeZone = event[3]
    if (timeZone && timeZone !== 'null') {
      session.timeZone = timeZone
    }
    session.timezoneOffset = event[4]
    updateRequestSession(ws.session_id, session)
    let cookie = event[5]
    if (cookie) {
      getWsCookies(ws.ws).unsignedCookies = Object.fromEntries(
        new URLSearchParams(
          cookie
            .split(';')
            .map(s => s.trim())
            .join('&'),
        ),
      )
    }
    navigation_type = event[6]
    navigation_method = event[7]
    logRequest(ws.request, 'ws', url, ws.session_id)
  } else if (event[0][0] === '/') {
    event = event as ClientRouteMessage
    eventType = 'route'
    url = event[0]
    args = event.slice(1)
    logRequest(ws.request, 'ws', url, ws.session_id)
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
  try {
    await then(
      matchRoute(context),
      route => {
        let App = layouts[route.layout_type || config.layout_type]
        let node = App(route)
        if (navigation_type === 'express' && navigation_method !== 'GET') return
        dispatchUpdate(context, node, route.title)
      },
      onError,
    )
  } catch (error) {
    onError(error)
  }
  function onError(error: unknown) {
    if (error == EarlyTerminate) {
      return
    }
    if (error instanceof MessageException) {
      ws.send(error.message)
      return
    }
    console.error(error)
  }
}
