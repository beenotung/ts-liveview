import { Request, Response, NextFunction } from 'express'
import { Session } from '../session'
import { Router, Context as RouterContext } from './router/core'

export type Context = ExpressContext | LiveviewContext
export type ExpressContext = {
  type: 'express'
  req: Request
  res: Response
  next: NextFunction
}
export type LiveviewContext = {
  type: 'liveview'
  session: Session
  params: any
  query: any
}

export type RouteHandler = (context: Context,) => void
export type ViewRouter = Router<RouteHandler>

export function routerToExpressMiddleware(router: ViewRouter) {
  return (req: Request, res: Response, next: NextFunction) => {
    let match = router.route(req.url)
    if (!match) {
      next()
      return // 404
    }
    match.value({
      type: 'express',
      req,
      res,
      next,
    })
  }
}
