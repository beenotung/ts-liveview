import JSX from './jsx/jsx.js'
import type { index } from '../../template/index.html'
import { loadTemplate } from '../template.js'
import express from 'express'
import type { ExpressContext, WsContext } from './context.js'
import type { Element } from './jsx/types'
import { nodeToHTML, writeNode } from './jsx/html.js'
import { sendHTMLHeader } from './express.js'
import { Redirect, Switch } from './components/router.js'
import { OnWsMessage } from '../ws/wss.js'
import { dispatchUpdate } from './jsx/dispatch.js'
import { EarlyTerminate } from './helpers.js'
import { getWSSession } from './session.js'
import { capitalize } from './string.js'
import NotMatch from './pages/not-match.js'
import Home from './pages/home.js'
import About, { License } from './pages/about.js'
import Thermostat from './pages/thermostat.js'
import Editor from './pages/editor.js'
import AutoCompleteDemo from './pages/auto-complete-demo.js'
import DemoForm from './pages/demo-form.js'
import DemoCookieSession from './pages/demo-cookie-session.js'
import Chatroom from './pages/chatroom.js'
import { Menu } from './components/menu.js'
import type { ClientMessage } from '../../client/index'
import escapeHtml from 'escape-html'
import { Flush } from './components/flush.js'
import { config } from '../config.js'
import Style from './components/style.js'
import Stats from './stats.js'
import { MuteConsole } from './components/script.js'

let template = loadTemplate<index>('index')

let scripts = config.development ? (
  <script src="/js/index.js" type="module" defer></script>
) : (
  <>
    <MuteConsole />
    <script src="/js/bundle.min.js" type="module" defer></script>
  </>
)

function formatMenuText(href: string): string {
  let text = href.substring(1)
  if (!text.includes('/')) {
    text = text.split('-').map(capitalize).join('-')
  }
  return text
}

export function App(): Element {
  // you can write the AST direct for more compact wire-format
  return [
    'div.app',
    {},
    [
      // or you can write in JSX for better developer-experience (if you're coming from React)
      <>
        {Style(/* css */ `
h1.title {
  color: darkblue;
}
h1.title a {
  font-size: 1rem;
}
`)}
        <h1 class="title">
          ts-liveview{' '}
          <a href="https://news.ycombinator.com/item?id=22830472">HN</a>{' '}
          <a href="https://github.com/beenotung/ts-liveview">git</a>
        </h1>
        {scripts}
        <Stats />
        <Menu
          attrs={{ style: 'margin: 1em 0' }}
          matchPrefix
          routes={[
            ['/home', 'Home', '/'],
            ...[
              '/about',
              '/thermostat',
              '/editor',
              '/auto-complete',
              '/form',
              '/cookie-session',
              '/chatroom',
              '/some/page/that/does-not/exist',
            ].map(href => [href, formatMenuText(href)] as [string, string]),
          ]}
        />
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
              '/chatroom': <Chatroom.index />,
              '/chatroom/typing': <Chatroom.typing />,
              '/chatroom/rename': <Chatroom.rename />,
              '/chatroom/send': <Chatroom.send />,
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
              '/server/app/app.tsx': <Redirect href="/about/markdown" />,
              '/server/app/pages/chatroom.tsx': <Redirect href="/chatroom" />,
            },
            <NotMatch />,
          )}
        </fieldset>
        <Flush />
      </>,
    ],
  ]
}

/* calling <App/> will transform the JSX to AST for each rendering */
/* or you can reuse a pre-computed AST as below */
const AppAST = App()

export let appRouter = express.Router()

// non-streaming routes
appRouter.use('/cookie-session/token', (req, res, next) => {
  try {
    let context: ExpressContext = {
      type: 'express',
      req,
      res,
      next,
      url: req.url,
    }
    let html = nodeToHTML(<DemoCookieSession.Token />, context)
    res.end(html)
  } catch (error) {
    if (error === EarlyTerminate) {
      return
    }
    res.status(500).end(String(error))
  }
})

// html-streaming routes
appRouter.use((req, res, next) => {
  sendHTMLHeader(res)

  let page = capitalize(req.url.split('/')[1] || 'Home Page')
  let description = 'Demo website of ts-liveview'
  let appPlaceholder = '<!-- app -->'
  let html = template({
    title: `${page} - LiveView Demo`,
    description,
    app: appPlaceholder,
  })
  let idx = html.indexOf(appPlaceholder)

  let beforeApp = html.slice(0, idx)
  res.write(beforeApp)
  res.flush()

  let afterApp = html.slice(idx + appPlaceholder.length)

  let context: ExpressContext = {
    type: 'express',
    req,
    res,
    next,
    url: req.url,
  }
  try {
    // send the html chunks in streaming
    writeNode(res, AppAST, context)
  } catch (error) {
    if (error === EarlyTerminate) {
      return
    }
    console.error('Failed to render App:', error)
    res.status(500)
    if (error instanceof Error) {
      res.write('Internal Error: ' + escapeHtml(error.message))
    } else {
      res.write('Unknown Error: ' + escapeHtml(String(error)))
    }
  }

  res.write(afterApp)

  if ('skip streaming test') {
    res.end()
    return
  }
  testStreaming(res)
})

function testStreaming(res: express.Response) {
  let i = 0
  let timer = setInterval(() => {
    i++
    res.write(i + '\n')
    res.flush()
    if (i > 5) {
      clearInterval(timer)
      res.end()
    }
  }, 1000)
}

export let onWsMessage: OnWsMessage<ClientMessage> = (event, ws, wss) => {
  console.log('ws message:', event)
  // TODO handle case where event[0] is not url
  let eventType: string | undefined
  let url: string
  let args: any[] | undefined
  let locale: string | undefined
  let timeZone: string | undefined
  if (event[0] === 'mount') {
    eventType = 'mount'
    url = event[1]
    locale = event[2]
    timeZone = event[3]
  } else if (event[0][0] === '/') {
    eventType = 'route'
    url = event[0]
    args = event.slice(1)
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
  let session = getWSSession(ws)
  session.url = url
  if (locale) {
    session.locales = locale
  }
  if (timeZone) {
    session.timeZone = timeZone
  }
  dispatchUpdate(AppAST, context)
}
