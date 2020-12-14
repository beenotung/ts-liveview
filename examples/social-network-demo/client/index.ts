import type { ServerMessage } from 'ts-liveview'
import { pushState } from 'ts-liveview/dist/client/history'
import { onPatch } from 'ts-liveview/dist/client/view'
import { MessageType } from 'ts-liveview/dist/types/enum'
import type { Primus } from 'typestub-primus'

let primus: Primus

function init() {
  if (primus) {
    console.debug('init when hot reload')
    return
  }
  console.debug('init')
  Object.assign(window, { send, goto, pop })
  primus = (window as any).Primus.connect()
  primus.on('close', () => {
    console.debug('disconnected with server')
  })
  primus.on('open', () => {
    console.debug('connected with server')
    sendUrl()
  })
  primus.on('data', (data: any) => {
    console.debug('data', data)
    if (typeof data === 'object' && data !== null) {
      const message = data as ServerMessage
      switch (message.type) {
        case MessageType.patch:
          return onPatch(message)
        case MessageType.pushState:
          return pushState(message)
      }
    }
    console.error('unknown data from server:', data)
  })
  window.onpopstate = pop
  const origin = location.origin
  document.body.addEventListener('click', event => {
    const a = event.target
    if (a instanceof HTMLAnchorElement) {
      const href = a.href
      if (href.startsWith(origin)) {
        event.preventDefault()
        const url = href.substring(origin.length)
        goto(url)
      }
    }
  })
}

export function send(...args: any[]) {
  console.debug('send', args)
  primus.write(args)
}

function goto(url: string, title?: string): false {
  if (title) {
    history.pushState({ title }, title, url)
    document.title = title
  } else {
    history.pushState(null, '', url)
  }
  send('url', url)
  return false
}

function pop(event: PopStateEvent) {
  if (event.state?.title) {
    document.title = event.state.title
  }
  sendUrl()
}

function sendUrl() {
  send('url', location.href.replace(location.origin, ''))
}

if (typeof window !== 'undefined') {
  init()
}
