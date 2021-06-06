import type express from 'express'
import type { Server } from 'ws'
import type { ServerMessage } from '../../client'
import type { ManagedWebsocket } from '../ws/wss'
import type { RouteContext } from 'url-router.ts'

export type Context = ExpressContext | WsContext

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
