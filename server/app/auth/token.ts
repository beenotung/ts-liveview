import { randomBytes } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import type { Context } from '../context.js'
import { getSecureCookie, secure, getWsCookie } from '../cookie.js'
import { EarlyTerminate } from '../helpers.js'

const LOOP_BATCH = 5000
const BIT_LENGTH = 258
export function loop(resolve: (token: string) => void) {
  for (let i = 0; i < LOOP_BATCH; i++) {
    const token = randomBytes(BIT_LENGTH).toString('base64')
    if (token.includes('/') || token.includes('+')) {
      continue
    }
    resolve(token)
    return
  }
  setTimeout(loop, 0, resolve)
}

export function genToken() {
  return new Promise<string>(loop)
}

export function genTokenSync(): string {
  for (;;) {
    const token = randomBytes(BIT_LENGTH).toString('base64')
    if (token.includes('/') || token.includes('+')) {
      continue
    }
    return token
  }
}

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const EXP = 90 * DAY

export function tokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const cookies = getSecureCookie(req, res)
    if (cookies.token) {
      next()
      return
    }
    genToken().then(token => {
      setToken(req, res, token)
      next()
    })
  } catch (error) {
    if (error === EarlyTerminate) {
      return
    }
    next(error)
  }
}

export function setToken(req: Request, res: Response, token: string) {
  req.cookies.token = token
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    signed: false,
    expires: new Date(Date.now() + EXP),
    secure,
  })
}

export function getOrSetTokenSync(req: Request, res: Response): string {
  const cookies = getSecureCookie(req, res)
  if (cookies.token) {
    return cookies.token
  }
  const token = genTokenSync()
  setToken(req, res, token)
  return token
}

export function getContextToken(context: Context): string | null {
  if (context.type === 'express') {
    const { req, res } = context
    const cookies = getSecureCookie(req, res)
    return cookies.token || null
  }
  if (context.type === 'ws') {
    const cookies = getWsCookie(context.ws.ws)
    const token = cookies.token
    return token || null
  }
  return null
}
