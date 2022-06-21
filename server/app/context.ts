import type express from 'express'
import type { ManagedWebsocket } from '../ws/wss'
import type { RouteContext } from 'url-router.ts'
import type { Session } from './session'
import { PageRoute } from './routes'

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

export const ContextSymbol = Symbol('context')

type Attrs = {
  [ContextSymbol]: Context
}

export function getContext(attrs: object): Context {
  let context = (attrs as Attrs)[ContextSymbol]
  if (!context) {
    throw new Error(
      'getContext() should be passed attrs from functional component',
    )
  }
  return context
}

export function getContextUrl(attrs: object): string {
  let context = (attrs as Attrs)[ContextSymbol]
  if (!context) {
    throw new Error(
      'getContext() should be passed attrs from functional component',
    )
  }
  if (context.type === 'static') {
    throw new Error('url is not supported in static context')
  }
  return context.url
}

export function getRouterContext(attrs: object) {
  let context: Context = (attrs as Attrs)[ContextSymbol]
  if (!context) {
    throw new Error(
      'getContext() should be passed attrs from functional component',
    )
  }
  if (context.type === 'static') {
    throw new Error(
      'Assertion failed, cannot get router context in static context',
    )
  }
  return context
}
