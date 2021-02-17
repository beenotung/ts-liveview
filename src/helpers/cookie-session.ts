import cookieSession from 'cookie-session'
import type { RequestHandler } from 'express'
import type { IncomingMessage } from 'http'

export interface CookieSession<SessionData extends object> {
  session: RequestHandler
  autoRenewSession: RequestHandler
  decodeSession: (
    req: IncomingMessage,
    cb: (session: SessionData) => void,
  ) => void
}

export function makeCookieSession<SessionData extends object>(options: {
  maxAge: number
  minAge: number
  lastTimeKey?: keyof SessionData // default is 'lastTime'
  secret: string
}): CookieSession<SessionData> {
  const KEY: keyof SessionData = options.lastTimeKey || ('lastTime' as any)

  const session: RequestHandler = cookieSession({
    name: 'session',
    secret: options.secret,
    maxAge: options.maxAge,
    httpOnly: true,
    sameSite: true,
  })

  function decodeSession(
    req: IncomingMessage,
    cb: (session: SessionData) => void,
  ) {
    session(req as any, {} as any, () => {
      cb((req as any).session)
    })
  }

  const autoRenewSession: RequestHandler = (req, res, next) => {
    const last = (req.session as any)[KEY]
    const now = Date.now()
    if (!last || now - last <= options.minAge) {
      (req.session as any)[KEY] = now
    }
    next()
  }

  return {
    session,
    autoRenewSession,
    decodeSession,
  }
}
