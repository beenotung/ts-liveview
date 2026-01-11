import type { Router } from 'express'
import { proxy } from '../../../db/proxy.js'
import { getUrlId } from '../../../db/request-log.js'
import { toExpressContext } from '../context.js'
import { DynamicContext } from '../context.js'

// TODO insert to a log specific database instead of the main application database
export function storeErrorLog(
  options: {
    title: string
    error: unknown
    client_url: string
    api_url: string
    timestamp: number
  },
  context: DynamicContext,
) {
  let error = String(options.error)
  if (error == '[object Object]') {
    error = JSON.stringify(options.error)
  }
  let req = context.type === 'express' ? context.req : context.ws.request
  proxy.error_log.push({
    timestamp: options.timestamp,
    title: options.title,
    error,
    client_url_id: getUrlId(options.client_url),
    api_url_id: getUrlId(options.api_url),
    request_log_id: req.request_log_id!,
  })
}

function attachRoutes(app: Router) {
  app.post('/error-log', async (req, res, next) => {
    let { title, error, client_url, api_url, timestamp } = req.body
    let context = toExpressContext(req, res, next)
    storeErrorLog({ title, error, client_url, api_url, timestamp }, context)
    res.json({})
  })
}

export default {
  attachRoutes,
}
