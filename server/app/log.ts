import type { Request } from 'express'
import { storeRequestLog } from '../../db/request-log.js'
import { logIPInfo } from './ip.js'

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

  // Skip geolocation logging if DNT is enabled
  if (dnt === '1') {
    return
  }

  // Asynchronously fetch and store geolocation data (without storing IP)
  let ip = req.ip
  if (ip) {
    logIPInfo(ip, log_id).catch(error => {
      console.error('failed to log ip info for request log:', error)
    })
  }
}
