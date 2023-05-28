import { DAY } from '@beenotung/tslib/time.js'
import { Request, Response, NextFunction } from 'express'
import { Context } from '../context.js'
import { getContextCookie, mustCookieSecure } from '../cookie.js'

const auto_logout_interval = 90 * DAY
const auto_renew_interval = 30 * DAY

export function getAuthUserId(context: Context): number | null {
  let user_id = getContextCookie(context)?.signedCookies?.user_id
  return user_id ? +user_id : null
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
