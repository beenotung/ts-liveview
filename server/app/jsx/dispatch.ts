import type { ServerMessage } from '../../../client'
import type { VElement } from '../../../client/jsx/types'
import type { WsContext } from '../context'
import { EarlyTerminate, Message } from '../helpers.js'
import type { Element, Component } from './types'
import { nodeToVElementOptimized } from './vnode.js'

export function dispatchUpdate(node: Component | Element, context: WsContext) {
  console.log('dispatch update, node:')
  console.dir(node, { depth: 1 })
  try {
    const vElement: VElement = nodeToVElementOptimized(node, context)
    const message: ServerMessage = ['update', vElement]
    context.ws.send(message)
  } catch (error) {
    if (error === EarlyTerminate) {
      return
    }
    if (error instanceof Message) {
      context.ws.send(error.message)
      return
    }
    console.error('Failed to dispatch update:', error)
  }
}
