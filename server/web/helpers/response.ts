import type { VElement, VNode } from '../../../client/dom.js'
import type express from 'express'
import { VNodeToString } from '../../dom.js'
import type { ManagedWebsocket } from '../../ws/wss.js'
import type { ServerMessage } from '../../../client/index.js'
import type { Context } from '../context.js'
import { loadTemplate } from '../../template.js'

let template = loadTemplate<{
  title: string
  app: string
}>('index')

export function renderVNode(res: express.Response, node: VNode) {
  let html = VNodeToString(node)
  html = template({ title: 'todo', app: html })
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('X-Powered-By', 'ts-liveview')
  res.end(html)
}

export function updateVElement(ws: ManagedWebsocket, node: VElement) {
  let msg: ServerMessage = ['update', node]
  ws.send(msg)
}

export function sendVElement(context: Context, node: VElement) {
  switch (context.type) {
    case 'express':
      return renderVNode(context.res, node)
    case 'ws':
      return updateVElement(context.ws, node)
    default:
      console.debug('unknown context:', context)
  }
}
