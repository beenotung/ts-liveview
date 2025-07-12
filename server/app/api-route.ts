import type { ServerMessage } from '../../client/types'
import { apiEndpointTitle } from '../config.js'
import { EarlyTerminate, MessageException, HttpError } from '../exception.js'
import { renderError, showError } from './components/error.js'
import type { Context, ExpressContext, WsContext } from './context'
import type { PageRoute, StaticPageRoute } from './routes'

export type ExpressAPI<T extends object> = (
  context: ExpressContext,
) => Promise<T> | T

export function ajaxRoute<T extends object>(options: {
  description: string
  api: ExpressAPI<T>
}) {
  return {
    title: apiEndpointTitle,
    description: options.description,
    streaming: false,
    async resolve(context: Context) {
      if (context.type != 'express') {
        throw new Error('this endpoint only support ajax')
      }
      let res = context.res
      try {
        let json = await options.api(context)
        res.json(json)
      } catch (error) {
        let statusCode = 500
        if (error) {
          statusCode = (error as HttpError).statusCode || statusCode
        }
        res.status(statusCode)
        res.json({ error: String(error) })
      }
      throw EarlyTerminate
    },
    api: options.api,
  } satisfies PageRoute & {
    api: ExpressAPI<T>
  }
}

export function wsRoute(options: {
  description: string
  api: (context: WsContext) => Promise<ServerMessage> | ServerMessage
}): PageRoute {
  return {
    title: apiEndpointTitle,
    description: options.description,
    streaming: false,
    async resolve(context: Context) {
      if (context.type != 'ws') {
        throw new Error('this endpoint only support ws')
      }
      try {
        let message = await options.api(context)
        context.ws.send(message)
      } catch (error) {
        if (error == EarlyTerminate) {
          /* no need to do anything */
        } else if (error instanceof MessageException) {
          context.ws.send(error.message)
        } else {
          context.ws.send(showError(error))
        }
      }
      throw EarlyTerminate
    },
  }
}

export function errorRoute(
  error: unknown,
  context: Context,
  title: string,
  description: string,
): StaticPageRoute {
  if (error == EarlyTerminate || error instanceof MessageException) {
    throw error
  }
  if (context.type == 'ws' && typeof error == 'string') {
    throw new MessageException(showError(error))
  }
  return {
    title,
    description,
    node: renderError(error, context),
  }
}
