import type { ServerMessage } from '../../../client'
import type { VElement } from '../../../client/app/types'
import type { WsContext } from '../context'
import { Message } from '../helpers.js'
import type { Element, Component } from './types'
import { nodeToVNode } from './vnode.js'

export function dispatchUpdate(node: Component | Element, context: WsContext) {
  console.log('dispatch update, node:')
  console.dir(node, { depth: 20 })
  try {
    let vElement = nodeToVNode(node, context) as VElement
    // TODO: think how to enable custom update logic instead of full re-render
    let message: ServerMessage = ['update', vElement]
    context.ws.send(message)
  } catch (error) {
    if (error instanceof Message) {
      context.ws.send(error.message)
    } else {
      console.error('Failed to dispatch update:', error)
    }
  }
}
