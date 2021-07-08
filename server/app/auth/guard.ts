import { debugLog } from '../../debug.js'
import type { Context } from '../context.js'
import { Cookie, getWsCookie } from '../cookie.js'
import { genTokenSync } from './token.js'
import { getSecureCookie, secure } from '../cookie.js'

const log = debugLog('auth/guard.ts')

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const EXP = 90 * DAY

export function getContextCookie(context: Context): Cookie | null {
  if (context.type === 'express') {
    return getSecureCookie(context.req, context.res)
  }
  if (context.type === 'ws') {
    return getWsCookie(context.ws.ws)
  }
  return null
}

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
  if (context.type === 'ws') {
    const cookies = getWsCookie(context.ws.ws)
    const token = cookies.token
    return token || null
  }
  return null
}
