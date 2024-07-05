import type { ServerMessage } from '../client/types'
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
