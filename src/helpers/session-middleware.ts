import { randomBytes } from 'crypto'
import type { CookieOptions } from 'express'
import type { NextFunction, Request, Response } from 'express-serve-static-core'
import type { IncomingMessage, ServerResponse } from 'http'

export let defaultName = 'sid'
export type NewIdFn = (cb: (id: string) => void) => void
export let defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: true,
  maxAge:
    1000 * // ms
    60 * // second
    60 * // minute
    24 * // hour
    30 * // month
    3, // quarter
}

export function createNewIdFn(ids: Record<string, true>): NewIdFn {
  return function newIdFn(cb: (id: string) => void): void {
    for (;;) {
      const id = randomBytes(64).toString('base64')
      if (id in ids) {
        continue
      }
      ids[id] = true
      cb(id)
      return
    }
  }
}

type RequestHandler = (
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) => any

export function createSession(options?: {
  name?: string
  newIdFn?: NewIdFn
  cookie?: CookieOptions
}): RequestHandler {
  const name = options?.name || defaultName
  const cookieOptions = options?.cookie || defaultCookieOptions
  const ids: Record<string, true> = {}
  const newIdFn: NewIdFn = options?.newIdFn || createNewIdFn(ids)
  return function session(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies) {
      // cookie is not supported
      next()
    }
    if (req.sessionID) {
      // already assigned session by other middleware
      next()
    }
    if (req.cookies[name] in ids) {
      req.sessionID = req.cookies[name]
      // old session
      return next()
    }
    // new session
    newIdFn(id => {
      res.cookie(name, id, cookieOptions)
      req.sessionID = id
      next()
    })
  } as RequestHandler
}
