import { DAY } from '@beenotung/tslib/time.js'
import { Request, Response, NextFunction } from 'express'
import { Context } from '../context.js'
import { getContextCookies, mustCookieSecure } from '../cookie.js'
import { User, proxy } from '../../../db/proxy.js'
import { debugLog } from '../../debug.js'

let log = debugLog('user.ts')
log.enabled = true

const auto_logout_interval = 90 * DAY
const auto_renew_interval = 30 * DAY

export function getAuthUserId(context: Context): number | null {
  let idStr = getContextCookies(context)?.signedCookies?.user_id
  if (!idStr) return null
  let id = +idStr
  return id && id in proxy.user ? id : null
}

export function getAuthUser(context: Context): User | null {
  let idStr = getContextCookies(context)?.signedCookies?.user_id
  if (!idStr) return null
  let id = +idStr
  if (!id) return null
  return proxy.user[id] || null
}

export type AuthUserRole = 'guest' | 'admin' | 'user'

export function getAuthUserRole(context: Context): AuthUserRole {
  let user = getAuthUser(context)
  return !user ? 'guest' : user.is_admin ? 'admin' : 'user'
}

export function writeUserIdToCookie(res: Response, user_id: number) {
  const now = Date.now()
  res.cookie('user_id', user_id, {
    secure: mustCookieSecure,
    sameSite: 'lax',
    httpOnly: true,
    signed: true,
    expires: new Date(now + auto_logout_interval),
  })
  res.cookie('renew_after', now + auto_renew_interval)
}

export function eraseUserIdFromCookie(res: Response) {
  res.clearCookie('user_id')
  res.clearCookie('renew_after')
  delete res.req.signedCookies.user_id
}

export function clearInvalidUserId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let user_id = req.signedCookies.user_id
  if (user_id && !(user_id in proxy.user)) {
    log('erase invalid user_id:', user_id)
    eraseUserIdFromCookie(res)
  }
  next()
}

export function renewAuthCookieMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let renew_after = +req.cookies.renew_after
  let user_id = +req.signedCookies.user_id
  if (renew_after && user_id && Date.now() > renew_after) {
    writeUserIdToCookie(res, user_id)
  }
  next()
}
