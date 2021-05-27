import express from 'express'
import { debugLog } from '../debug.js'
import { loadTemplate } from '../template.js'
import { flagsToClassName, VElementToString } from '../dom.js'
import { Fragment } from '../components/fragment.js'
import type { OnWsMessage } from '../ws/wss.js'
import { notImplemented, pageNotFoundView } from './errors.js'
import { homeView } from './home.js'
import { Style } from '../components/style.js'
import JSX from '../../client/jsx.js'
import { thermostatView } from './thermostat.js'
import type { View, EventListener } from './view.js'

let log = debugLog('router.ts')
log.enabled = true

let template = loadTemplate<{
  title: string
  app: string
}>('index')

export let router = express.Router()

type Page = {
  url: string
  view: View
}
let pages: Page[] = [
  { url: 'home', view: homeView },
  { url: 'thermostat', view: thermostatView },
]

// page indices
let pageUrls: string[] = []
let pageRecord: Record<string, View> = {}
// key -> listeners
let messageListeners: Record<string, EventListener[]> = {}

// populate page indices
pages.forEach(({ url, view }) => {
  pageUrls.push(url)

  pageRecord[url] = view

  if (view.onMessages) {
    Object.entries(view.onMessages).forEach(([type, onMessage]) => {
      if (type in messageListeners) {
        messageListeners[type].push(onMessage)
      } else {
        messageListeners[type] = [onMessage]
      }
    })
  }
})

export let onWSMessage: OnWsMessage = (event, ws, wss) => {
  let [type, value] = event
  if (!(type in messageListeners)) {
    log(`unknown ws message type:`, type)
    return
  }
  messageListeners[type].forEach(listener => {
    listener(value, ws, wss)
  })
}

function Menu({ selected }: { selected: string }) {
  return (
    <Fragment>
      <Style
        css={`
          .menu > a {
            margin: 0.25em;
            text-decoration: none;
            border-bottom: 1px solid black;
          }
          .menu > a.selected {
            border-bottom: 2px solid black;
          }
        `}
      />
      <h1>Menu</h1>
      <div class="menu">
        <Fragment
          list={pageUrls.map(url => {
            let className = flagsToClassName({ selected: url === selected })
            return (
              <a href={url} class={className}>
                {url}
              </a>
            )
          })}
        />
      </div>
    </Fragment>
  )
}

function App({ url }: { url: string }) {
  let view = pageRecord[url] || pageNotFoundView
  let node = view.initView || view.render?.({ url }) || notImplemented.initView
  return (
    <div id="app" class="light live">
      <Menu selected={url} />
      {node}
    </div>
  )
}

router.get('/', (req, res) => {
  res.redirect('/home')
})

router.get('/thermostat/inc', (req, res) => {
  thermostatView.onMessages.inc()
  res.redirect('/thermostat')
})
router.get('/thermostat/dec', (req, res) => {
  thermostatView.onMessages.dec()
  res.redirect('/thermostat')
})

router.get('/:page', (req, res, next) => {
  let page = req.params.page
  res.setHeader('Connection', 'Keep-Alive')
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Link', `<http://localhost:8100/${page}>; rel="canonical"`)
  let html = template({
    title: `${page} - LiveView Demo`,
    app: VElementToString(<App url={page} />),
  })
  res.end(html)
})
