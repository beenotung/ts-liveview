import { randomBytes } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { LocalStorage } from 'node-localstorage'

function defaultNewSessionIdFn() {
  return randomBytes(64).toString('hex')
}

export function createPersistentSession(options?: {
  sessionKey?: string
  newSessionIdFn?: () => string
  storage?: LocalStorage
}) {
  const sessionKey = options?.sessionKey || 'session-id'
  const newSessionIdFn = options?.newSessionIdFn || defaultNewSessionIdFn
  const storage =
    options?.storage ||
    function obtainNewSessionId() {
      for (;;) {
        const id = newSessionIdFn()
        if (storage.getItem(id)) {
          continue
        }
        storage.setItem(id, '1')
        return id
      }
    }

  function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
    if (sessionKey in req.cookies) {
      console.log('old session:', req.cookies[sessionKey])
      return
    }
    const sessionId = obtainNewSessionId()
    res.cookie(sessionKey, sessionId)
    console.log('new session:', sessionId)
    next()
  }

  return sessionMiddleware
}
