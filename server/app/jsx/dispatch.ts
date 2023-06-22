import type { ServerMessage } from '../../../client/types'
import type { VElement, title } from '../../../client/jsx/types'
import type { WsContext } from '../context'
import { EarlyTerminate, MessageException } from '../helpers.js'
import type { Element, Component } from './types'
import { nodeToVElementOptimized } from './vnode.js'

export function dispatchUpdate(
  context: WsContext,
  node: Component | Element,
  title?: title,
) {
  console.log('dispatch update, node:')
  console.dir(node, { depth: 1 })
  try {
    const vElement: VElement = nodeToVElementOptimized(node, context)
    const message: ServerMessage = title
      ? ['update', vElement, title]
      : ['update', vElement]
    context.ws.send(message)
  } catch (error) {
    if (error === EarlyTerminate) {
      return
    }
    if (error instanceof MessageException) {
      context.ws.send(error.message)
      return
    }
    console.error('Failed to dispatch update:', error)
  }
}
