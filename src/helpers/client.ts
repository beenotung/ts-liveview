import { ClientMessage, ServerMessage } from '../message'
import morphdom from 'morphdom'
import { Diff, Template, toHTML } from '../h'

function main() {
  let retryInterval = 1000

  function startWebSocket() {
    let ws = new WebSocket(location.origin.replace('http', 'ws'))
    ws.onmessage = ev => {
      let message = JSON.parse(ev.data) as ServerMessage
      onMessage(message)
    }
    ws.onerror = ev => {
      console.debug('ws err', ev)
    }
    ws.onclose = ev => {
      console.debug('ws close', ev)
      setTimeout(() => {
        ws = startWebSocket()
      }, retryInterval)
      retryInterval *= 1.1
    }
    return ws
  }

  let ws = startWebSocket()


  function paint(e: Element, html: string) {
    morphdom(e, html, {
      onBeforeElUpdated: (fromEl, toEl) => {
        if (fromEl.isEqualNode(toEl)) {
          return false
        }
        if (document.activeElement === fromEl) {
          debugger;
          switch (fromEl.tagName) {
            case 'INPUT':
            case 'SELECT':
              return false
          }
        }
        return true
      },
    })
  }

  let lastTemplates = new Map<string, Template>()

  function repaint(selector: string, e: Element, template: Template) {
    let html = toHTML(template)
    paint(e, html)
    lastTemplates.set(selector, template)
  }

  function patch(selector: string, e: Element, diff: Diff) {
    const template = lastTemplates.get(selector)
    if (!template) {
      console.error('missing template')
      return
    }
    diff.forEach(([i, v]) => template.dynamics[i] = v)
    repaint(selector, e, template)
  }

  const messageQueue: ServerMessage[] = []

  function onMessage(message: ServerMessage) {
    let selector = message.selector
    let e = document.querySelector(selector)
    if (!e) {
      // console.debug('waiting for', selector)
      messageQueue.push(message)
      return
    }
    switch (message.type) {
      case 'paint':
        paint(e, message.html)
        break
      case 'repaint':
        repaint(selector, e, message.template)
        break
      case 'patch':
        patch(selector, e, message.diff)
        break
      default: {
        let x: never = message
        console.error('unknown server message:', x)
      }
    }
    let top = messageQueue.pop()
    if (top) {
      onMessage(top)
    }
  }

  function send(...args: any[]) {
    let message: ClientMessage = { type: 'event', args }
    ws.send(JSON.stringify(message))
  }

  Object.assign(window, {
    send,
  })
}

if (typeof window !== 'undefined') {
  main()
}
