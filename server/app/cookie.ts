import cookieParser from 'cookie-parser'
import type WebSocket from 'ws'
import type ws from 'ws'
import type express from 'express'
import { config } from '../config.js'
import { debugLog } from '../debug.js'
import type { Context } from './context'
import { env } from '../env.js'

const log = debugLog('cookie.ts')
log.enabled = true

export const cookieMiddleware = cookieParser(env.COOKIE_SECRET)

export const mustCookieSecure = config.production

export function getSecureCookies(req: express.Request): Cookies {
  return {
    unsignedCookies: req.cookies,
    signedCookies: req.signedCookies,
  }
}

export type CookieDict = Record<string, string>

export type Cookies = {
  unsignedCookies: CookieDict
  signedCookies: CookieDict
}

const ws_cookies = new WeakMap<WebSocket, Cookies>()

export function listenWSSCookie(wss: ws.Server) {
  wss.on('connection', (ws, request) => {
    const req = request as express.Request
    const res = {} as express.Response
    req.secure ??= req.headers.origin?.startsWith('https') || false
    req.protocol ??= req.secure ? 'wss' : 'ws'
    req.originalUrl ??= req.url || '/'
    cookieMiddleware(req, res, () => {
      const cookies = getSecureCookies(req)
      ws_cookies.set(ws, cookies)
    })
    ws.on('close', () => {
      ws_cookies.delete(ws)
    })
  })
}

export function getWsCookies(ws: WebSocket): Cookies {
  const cookies = ws_cookies.get(ws)
  if (!cookies) {
    log('no ws cookies')
    throw new Error('no ws cookies')
  }
  return cookies
}

export function getContextCookies(context: Context): Cookies | null {
  if (context.type === 'express') {
    return getSecureCookies(context.req)
  }
  if (context.type === 'ws') {
    return getWsCookies(context.ws.ws)
  }
  return null
}
