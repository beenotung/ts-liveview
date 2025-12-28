import type { Request } from 'express'
import { storeRequestLog } from '../../db/request-log.js'
import { logIPInfo } from './ip.js'

export function logRequest(
  req: Request,
  method: string,
  url: string,
  session_id: number | null,
) {
  let log_id = storeRequestLog({
    method,
    url,
    user_agent: req.headers['user-agent'] || null,
    session_id,
  })

  // Respect Do Not Track header - skip geolocation logging if DNT is enabled
  let dnt = req.headers['dnt']
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
