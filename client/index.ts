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
import type { WindowStub } from './internal'
import type { ClientMessage, ServerMessage } from './types'

let win = window as unknown as WindowStub
let origin = location.origin
let wsUrl = origin.replace('http', 'ws')
connectWS({
  createWS(protocol) {
    let status = document.querySelector('#ws_status')
    if (status) {
      status.textContent = 'connecting ws...'
    }
    return new WebSocket(wsUrl, [protocol])
  },
  attachWS(ws) {
    console.debug('attach ws')

    function emit(...args: unknown[]): void
    function emit(): void {
      ws.send(Array.from(arguments) as ClientMessage)
    }

    function emitHref(event: MouseEvent, flag?: 'q') {
      if (event.ctrlKey || event.shiftKey) {
        return // do not prevent open in new tab or new window
      }
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
      submitForm(form)
      event.preventDefault()
    }

    function submitForm(form: HTMLFormElement) {
      let formData = new FormData(form)
      if (form.method === 'get') {
        let url = new URL(form.action || location.href)
        url.search = new URLSearchParams(formData as {}).toString()
        let href = url.href.replace(origin, '')
        history.pushState(null, document.title, href)
        emit(href)
        return
      }
      let data = {} as Record<string, FormDataEntryValue | FormDataEntryValue[]>
      formData.forEach((value, key) => {
        if (key in data) {
          let prevValue = data[key]
          if (Array.isArray(prevValue)) {
            prevValue.push(value)
          } else {
            data[key] = [prevValue, value]
          }
        } else {
          data[key] = value
        }
      })
      let url = form.getAttribute('action') || location.href.replace(origin, '')
      emit(url, data)
    }

    window.onpopstate = (_event: PopStateEvent) => {
      let url = location.href.replace(origin, '')
      emit(url)
    }

    win.emit = emit
    win.emitHref = emitHref
    win.emitForm = emitForm
    win.submitForm = submitForm
    win.remount = mount

    ws.ws.addEventListener('open', mount)

    function mount() {
      let language =
        navigator && navigator.language ? navigator.language : undefined
      let url = location.href.replace(origin, '')
      let timeZone = Intl
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : undefined
      let timezoneOffset = new Date().getTimezoneOffset()
      let message: ClientMessage = [
        'mount',
        url,
        language,
        timeZone,
        timezoneOffset,
        document.cookie,
        win._navigation_type_,
        win._navigation_method_,
      ]
      ws.send(message)
    }

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

function onServerMessage(message: ServerMessage) {
  switch (message[0]) {
    case 'update':
      if (message[2]) {
        document.title = message[2]
      }
      updateElement(message[1])
      break
    case 'update-in':
      if (message[3]) {
        document.title = message[3]
      }
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
    case 'set-title':
      document.title = message[1]
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

function upload(event: Event) {
  let form = event.target as HTMLFormElement
  let result = fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
  })
  event.preventDefault()
  return result
}
win.upload = upload
