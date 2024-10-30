import type { ServerMessage } from '../client/types'
import { isAjax, Context } from './app/context.js'
import type { Node } from './app/jsx/types'

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
  }
}

export class MessageException {
  constructor(public message: ServerMessage) {}
}

export function throwIfInAPI(
  error: unknown,
  selector: string,
  context: Context,
) {
  let message: ServerMessage =
    error instanceof MessageException
      ? error.message
      : [
          'batch',
          [
            ['update-text', selector, String(error)],
            ['add-class', selector, 'error'],
          ],
        ]
  if (context.type == 'ws') {
    context.ws.send(message)
    throw EarlyTerminate
  }
  if (context.type == 'express' && isAjax(context)) {
    context.res.json({ message })
    throw EarlyTerminate
  }
}

export class ErrorNode {
  constructor(public node: Node) {}
}

/**
 * @description To quickly stop nested VNode traversal
 *  */
export const EarlyTerminate = 'EarlyTerminate' as const

/**
 * @alias {EarlyTerminate}
 *  */
export const Done = EarlyTerminate
