import type { Request } from 'express'
import { storeRequestLog } from '../../db/request-log.js'
import { getRequestIP, logIPInfo } from './ip.js'
import { env } from '../env.js'

declare global {
  namespace Express {
    interface Request {
      request_log_id?: number
    }
  }
}

export function logRequest(
  req: Request,
  method: string,
  url: string,
  session_id: number | null,
) {
  // Respect Do Not Track header - skip tracking data collection if DNT is enabled
  let dnt = req.headers['dnt']
  let user_agent = dnt === '1' ? null : req.headers['user-agent'] || null

  let log_id = storeRequestLog({
    method,
    url,
    user_agent,
    session_id,
  })
  req.request_log_id = log_id

  // Skip geolocation logging if DNT is enabled
  if (dnt === '1') {
    return
  }

  // Asynchronously fetch and store geolocation data (without storing IP)
  let ip = getRequestIP(req)
  if (ip && env.FIND_IP_API_KEY !== 'skip') {
    logIPInfo(ip, log_id).catch(error => {
      console.error('failed to log ip info for request log:', error)
    })
  }
}
