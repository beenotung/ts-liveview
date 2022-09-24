import type express from 'express'
import type { ManagedWebsocket } from '../ws/wss'
import type { RouteContext } from 'url-router.ts'
import type { Session } from './session'
import type { PageRoute } from './routes'

export type Context = StaticContext | DynamicContext

export type StaticContext = {
  type: 'static'
}

export type DynamicContext = ExpressContext | WsContext

export type ExpressContext = {
  type: 'express'
  req: express.Request
  res: express.Response
  next: express.NextFunction
} & RouterContext

export type WsContext = {
  type: 'ws'
  ws: ManagedWebsocket
  event?: string
  args?: unknown[]
  session: Session
} & RouterContext

export type RouterContext = {
  url: string
  routerMatch?: RouterMatch
}

export type RouterMatch = Omit<RouteContext<PageRoute>, 'value'>

export function getContextUrl(context: Context): string {
  if (context.type === 'static') {
    throw new Error('url is not supported in static context')
  }
  return context.url
}

export function castDynamicContext(context: Context): DynamicContext {
  if (context.type === 'static') {
    throw new Error(
      'Assertion failed, expect dynamic context, got static context',
    )
  }
  return context
}

export function getContextFormBody(context: Context): unknown | undefined {
  if (context.type === 'ws') {
    return context.args?.[0]
  }
  if (context.type === 'express') {
    return context.req.body
  }
}
