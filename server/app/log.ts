import type { Request } from 'express'
import { storeRequestLog } from '../../db/request-log.js'

export function logRequest(
  req: Request,
  method: string,
  url: string,
  session_id: number | null,
) {
  storeRequestLog({
    method,
    url,
    user_agent: req.headers['user-agent'] || null,
    session_id,
  })
}
