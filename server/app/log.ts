import type { Request } from 'express'
import { storeRequestLog } from '../../db/store.js'

export function logRequest(req: Request, method: string, url: string) {
  storeRequestLog({
    method,
    url,
    user_agent: req.headers['user-agent'] || null,
    user_id: +req.signedCookies.user_id || null,
  })
}
