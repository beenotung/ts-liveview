import type express from 'express'
import type { Server } from 'typestub-ws'
import type { ServerMessage } from '../../client'
import type { ManagedWebsocket } from '../ws/wss'
import type { RouteContext } from 'url-router.ts'
import type { Session } from './session'

export type Context = StaticContext | ExpressContext | WsContext

export type StaticContext = {
  type: 'static'
}

export type ExpressContext = {
  type: 'express'
  req: express.Request
  res: express.Response
  next: express.NextFunction
} & RouterContext

export type WsContext = {
  type: 'ws'
  ws: ManagedWebsocket<ServerMessage>
  wss: Server
  event?: string
  args?: any[]
  session: Session
} & RouterContext

export type RouterContext = {
  url: string
  routerMatch?: RouterMatch
}

export type RouterMatch = Omit<RouteContext<any>, 'value'>

export const ContextSymbol = Symbol('context')

export function getContext(attrs: object): Context {
  return (attrs as any)[ContextSymbol]
}

export function getContextUrl(attrs: object): string {
  let context: Context = (attrs as any)[ContextSymbol]
  if (context.type === 'static') {
    throw new Error('url is not supported in static context')
  }
  return context.url
}

export function getRouterContext(attrs: object) {
  let context: Context = (attrs as any)[ContextSymbol]
  if (context.type === 'static') {
    throw new Error(
      'Assertion failed, cannot get router context in static context',
    )
  }
  return context
}
