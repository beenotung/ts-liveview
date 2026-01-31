import type { Router } from 'express'
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
  console.log('stub: storeErrorLog', options)
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
