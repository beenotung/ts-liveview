import cookieParser from 'cookie-parser'
import type WebSocket from 'typestub-ws'
import type ws from 'typestub-ws'
import type express from 'express'
import { config } from '../config.js'
import { debugLog } from '../debug.js'
import { EarlyTerminate } from './helpers.js'
import { Context } from './context.js'

const log = debugLog('cookie.ts')
log.enabled = true

export const cookieMiddleware = cookieParser(config.cookie_secret)

export const secure = config.production

export function getSecureCookie(req: express.Request, res: express.Response) {
  if (!config.require_https) {
    return req.cookies
  }
  if (secure && !req.secure) {
    const protocol = req.protocol === 'ws' ? 'wss' : 'https'
    const to = `${protocol}://${req.headers.host}${req.originalUrl}`
    log('redirect non-secure request to:', to)
    res.redirect(to, 301)
    throw EarlyTerminate
  }
  return req.cookies
}

export type Cookie = Record<string, string>

const ws_cookies = new WeakMap<WebSocket, Cookie>()

export function listenWSSCookie(wss: ws.Server) {
  wss.on('connection', (ws, request) => {
    const req = request as express.Request
    const res = {} as express.Response
    cookieMiddleware(req, res, () => {
      const cookies = getSecureCookie(req, res)
      ws_cookies.set(ws, cookies)
    })
    ws.on('close', () => {
      ws_cookies.delete(ws)
    })
  })
}

export function getWsCookie(ws: WebSocket): Cookie {
  const cookies = ws_cookies.get(ws)
  if (!cookies) {
    log('no ws cookies')
    throw new Error('no ws cookies')
  }
  return cookies
}

export function getContextCookie(context: Context): Cookie | null {
  if (context.type === 'express') {
    return getSecureCookie(context.req, context.res)
  }
  if (context.type === 'ws') {
    return getWsCookie(context.ws.ws)
  }
  return null
}
