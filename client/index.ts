import type { attrs, props, selector, VElement, VNode } from './jsx/types'
import {
  appendNode,
  removeNode,
  updateAllText,
  updateAttrs,
  updateElement,
  updateNode,
  updateProps,
  updateText,
  setValue,
} from './jsx/dom.js'
import { connectWS } from './ws/ws-lite.js'

let win = window as any
let origin = location.origin
let wsUrl = origin.replace('http', 'ws')
connectWS<ServerMessage>({
  createWS(protocol) {
    let status = document.querySelector('#ws_status')
    if (status) {
      status.textContent = 'connecting ws...'
    }
    return new WebSocket(wsUrl, [protocol])
  },
  attachWS(ws) {
    console.debug('attach ws')

    let emit = function emit() {
      ws.send(Array.from(arguments))
    } as (...args: any[]) => void

    function emitHref(event: Event, flag?: 'q') {
      let a = event.currentTarget as HTMLAnchorElement
      let url = a.getAttribute('href')
      if (flag !== 'q') {
        let title = a.getAttribute('title') || document.title
        history.pushState(null, title, url)
      }
      emit(url)
      event.preventDefault()
    }

    function emitForm(event: Event) {
      let form = event.target as HTMLFormElement
      let data = {} as any
      new FormData(form).forEach((value, key) => {
        data[key] = value
      })
      let url = form.getAttribute('action') || location.href.replace(origin, '')
      emit(url, data)
      event.preventDefault()
    }

    window.onpopstate = (event: PopStateEvent) => {
      let url = location.href.replace(origin, '')
      emit(url)
    }

    win.emit = emit
    win.emitHref = emitHref
    win.emitForm = emitForm

    ws.ws.addEventListener('open', () => {
      let locale =
        navigator && navigator.language ? navigator.language : undefined
      let url = location.href.replace(origin, '')
      let timezone = Intl
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : undefined
      let message: ClientMessage = ['mount', url, locale, timezone]
      ws.send(message)
    })

    const status = document.querySelector('#ws_status')
    if (status) {
      ws.ws.addEventListener('open', () => {
        status.textContent = 'connected ws'
      })
      ws.ws.addEventListener('close', () => {
        status.textContent = 'disconnected ws'
      })
    }
  },
  onMessage(event) {
    console.debug('on ws message:', event)
    onServerMessage(event)
  },
})

export type ClientMessage =
  | [
      type: 'mount',
      url: string,
      locale: string | undefined,
      timezone: string | undefined,
    ]
  | [url: string, data?: any]

export type ServerMessage =
  | ['update', VElement]
  | ['update-in', selector, VNode]
  | ['append', selector, VNode]
  | ['remove', selector]
  | ['update-text', selector, string | number]
  | ['update-all-text', selector, string]
  | ['update-attrs', selector, attrs]
  | ['update-props', selector, props]
  | ['set-value', selector, string | number]
  | ['batch', ServerMessage[]]
  | ['set-cookie', string]

function onServerMessage(message: ServerMessage) {
  switch (message[0]) {
    case 'update':
      updateElement(message[1])
      break
    case 'update-in':
      updateNode(message[1], message[2])
      break
    case 'append':
      appendNode(message[1], message[2])
      break
    case 'remove':
      removeNode(message[1])
      break
    case 'update-text':
      updateText(message[1], message[2])
      break
    case 'update-all-text':
      updateAllText(message[1], message[2])
      break
    case 'update-attrs':
      updateAttrs(message[1], message[2])
      break
    case 'update-props':
      updateProps(message[1], message[2])
      break
    case 'set-value':
      setValue(message[1], message[2])
      break
    case 'batch':
      message[1].forEach(onServerMessage)
      break
    case 'set-cookie':
      document.cookie = message[1]
      break
    default:
      console.error('unknown server message:', message)
  }
}

function get(url: string) {
  return fetch(url)
}
win.get = get
function del(url: string) {
  return fetch(url, { method: 'DELETE' })
}
win.del = del
