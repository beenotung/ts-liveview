import type { VElement, VNode } from '../../../client/app/types.js'
import type express from 'express'
import type { WsContext } from '../context.js'
import type { ServerMessage } from '../../../client/index.js'
import type { Context } from '../context.js'
import { loadTemplate } from '../../template.js'
import { nodeToHTML } from '../../app/jsx/html.js'
import { ExpressContext } from '../../app/context.js'

let template = loadTemplate<{
  title: string
  app: string
}>('index')

export function renderVNode(res: express.Response, node: VNode) {
  let context: ExpressContext = {
    type: 'express',
    req: res.req!,
    res,
    url: res.req!.url,
    next: res.req!.next!,
  }
  let html = nodeToHTML(node, context)
  html = template({ title: 'todo', app: html })
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('X-Powered-By', 'ts-liveview')
  res.end(html)
}

export function updateVElement(ws: WsContext['ws'], node: VElement) {
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
