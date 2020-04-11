import { syncDom, templateToHTML } from '../h'
import { ClientMessage, ServerMessage } from '../types/message'
import { ComponentTemplate, TemplateDiff } from '../types/view'

function main() {
  let retryInterval = 1000

  function getQueryUrl() {
    const hash = 'hash=' + encodeURIComponent(location.hash)
    const search = location.search
    if (search) {
      return search + '&' + hash
    } else {
      return '?' + hash
    }
  }

  function startWebSocket() {
    let url = location.origin.replace('http', 'ws')
    url += getQueryUrl()
    let ws = new WebSocket(url)
    ws.onmessage = ev => {
      const message = JSON.parse(ev.data) as ServerMessage
      onMessage(message)
    }
    ws.onerror = ev => {
      console.error('ws err', ev)
    }
    ws.onclose = ev => {
      // tslint:disable-next-line no-console
      console.debug('ws close', ev)
      setTimeout(() => {
        ws = startWebSocket()
      }, retryInterval)
      retryInterval *= 1.1
    }
    return ws
  }

  const ws = startWebSocket()

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
