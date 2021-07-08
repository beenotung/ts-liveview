import type express from 'express'
import { debugLog } from '../../debug.js'
import type { Context } from '../context.js'
import { EarlyTerminate } from '../helpers.js'
import { genTokenSync } from './token.js'

const log = debugLog('auth/guard.ts')

export const secure = process.env.NODE_ENV === 'production'

export function getSecureCookie(req: express.Request, res: express.Response) {
  if (secure && !req.secure) {
    const to = `https://${req.headers.host}${req.originalUrl}`
    log('redirect non-secure request to:', to)
    res.redirect(to, 301)
    throw EarlyTerminate
  }
  return req.cookies
}

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const EXP = 90 * DAY

export function getCookieTokenSync(context: Context): string | null {
  if (context.type === 'express') {
    const { req, res } = context
    const cookies = getSecureCookie(req, res)
    let token = cookies.token
    log('cookies:', req.cookies)
    if (token) {
      return token
    }
    token = genTokenSync()
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      signed: false,
      expires: new Date(Date.now() + EXP),
      secure,
    })
    return token
  }
  // TODO get session data for websocket client
  return null
}
