import cookieParser from 'cookie-parser'
import type WebSocket from 'ws'
import type ws from 'ws'
import type express from 'express'
import { debugLog } from '../debug.js'
import { EarlyTerminate } from './helpers.js'

const log = debugLog('cookie.ts')

export const cookieMiddleware = cookieParser()

export const secure = process.env.NODE_ENV === 'production'

export function getSecureCookie(req: express.Request, res: express.Response) {
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
  })
}

export function getWsCookie(ws: WebSocket): Cookie {
  const cookies = ws_cookies.get(ws)
  if (!cookies) {
    throw new Error('no ws cookies')
  }
  return cookies
}
