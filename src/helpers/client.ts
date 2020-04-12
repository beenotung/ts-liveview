import { syncDom, templateToHTML } from '../h'
import { ClientMessage, ServerMessage } from '../types/message'
import { ComponentTemplate, TemplateDiff } from '../types/view'

function main() {
  const initialRetryInterval = 1000
  let retryInterval = initialRetryInterval

  function getQueryUrl() {
    const hash = 'hash=' + encodeURIComponent(location.hash)
    const search = location.search
    if (search) {
      return search + '&' + hash
    } else {
      return '?' + hash
    }
  }

  let ws: WebSocket

  function startWebSocket(): WebSocket {
    let url = location.origin.replace('http', 'ws')
    url += getQueryUrl()
    ws = new WebSocket(url)
    ws.onopen = () => {
      console.log('ws connected')
      retryInterval = initialRetryInterval
    }
    ws.onmessage = ev => {
      const message = JSON.parse(ev.data) as ServerMessage
      onMessage(message)
    }
    ws.onerror = ev => {
      console.error('ws err', ev)
    }
    ws.onclose = ev => {
      // tslint:disable-next-line no-console
      if (ev.code !== 1006) {
        console.log('ws closed')
        return
      }
      console.log('ws closed abnormally, will retry after', retryInterval, 'ms')
      setTimeout(() => {
        ws = startWebSocket()
      }, retryInterval)
      retryInterval *= 1.1
    }
    return ws
  }

  ws = startWebSocket()

  function render(e: Element, template: ComponentTemplate) {
    templates.set(template.selector, template)
    const html = templateToHTML(template, childTemplate =>
      templates.set(childTemplate.selector, childTemplate),
    )
    syncDom(e, html)
  }

  function patch(e: Element, patch: TemplateDiff) {
    const selector = patch.selector
    const template = templates.get(selector)
    if (!template) {
      // missing template, request a full render message
      send('resendTemplate', selector)
      return
    }
    patch.diff.forEach(([i, v]) => (template.dynamics[i] = v))
    render(e, template)
  }

  const templates = new Map<string, ComponentTemplate>()

  const messageQueue: ServerMessage[] = []

  function onMessage(message: ServerMessage) {
    const selector = message.selector
    const e = document.querySelector(selector)
    if (!e) {
      // console.debug('waiting for', selector)
      messageQueue.push(message)
      return
    }
    switch (message.type) {
      case 'render':
        render(e, message)
        break
      case 'patch':
        patch(e, message)
        break
      default: {
        const x: never = message
        console.error('unknown server message:', x)
      }
    }
    const top = messageQueue.pop()
    if (top) {
      onMessage(top)
    }
  }

  function send(...args: any[]) {
    const message: ClientMessage = { type: 'event', args }
    ws.send(JSON.stringify(message))
  }

  Object.assign(window, {
    send,
  })
}

if (typeof window !== 'undefined') {
  main()
}
