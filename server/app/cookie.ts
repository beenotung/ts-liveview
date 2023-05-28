import cookieParser from 'cookie-parser'
import type WebSocket from 'ws'
import type ws from 'ws'
import type express from 'express'
import { config } from '../config.js'
import { debugLog } from '../debug.js'
import { EarlyTerminate } from './helpers.js'
import type { Context } from './context'

const log = debugLog('cookie.ts')
log.enabled = true

export const cookieMiddleware = cookieParser(config.cookie_secret)

export const mustCookieSecure = config.production

export function getSecureCookies(
  req: express.Request,
  res: express.Response,
): Cookies {
  if (config.require_https && mustCookieSecure && !req.secure) {
    const protocol = req.protocol === 'ws' ? 'wss' : 'https'
    const to = `${protocol}://${req.headers.host}${req.originalUrl}`
    log('redirect non-secure request to:', to)
    res.redirect(301, to)
    throw EarlyTerminate
  }
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
      const cookies = getSecureCookies(req, res)
      ws_cookies.set(ws, cookies)
    })
    ws.on('close', () => {
      ws_cookies.delete(ws)
    })
  })
}

export function getWsCookie(ws: WebSocket): Cookies {
  const cookies = ws_cookies.get(ws)
  if (!cookies) {
    log('no ws cookies')
    throw new Error('no ws cookies')
  }
  return cookies
}

export function getContextCookie(context: Context): Cookies | null {
  if (context.type === 'express') {
    return getSecureCookies(context.req, context.res)
  }
  if (context.type === 'ws') {
    return getWsCookie(context.ws.ws)
  }
  return null
}
