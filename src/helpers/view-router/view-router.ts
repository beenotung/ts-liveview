import { NextFunction, Request, Response } from 'express'
import { Component } from '../../h'
import { viewToHTML } from '../../h-client'
import { Session } from '../../session'
import { PrimitiveView } from '../../types/view'
import { toHTML } from '../render'
import { Router, Context as RouterContext } from '../router/core'

export type Context = ExpressContext | LiveviewContext
export type ExpressContext = {
  type: 'express'
  /* from Router.Context */
  url: string
  params: any
  query: any
  /* from express */
  req: Request
  res: Response
  next: NextFunction
}
export type LiveviewContext = {
  type: 'liveview'
  /* from Router.Context */
  url: string
  params: any
  query: any
  /* from LiveView.Session */
  session: Session
}

export type RouteHandler = (context: Context, cb: (view: Component) => void) => void
export type ViewRouteContext = {
  type: 'express'
  req: Request,
  res: Response,
  next: NextFunction
} | {
  type: 'liveview',
  session: Session
  next: NextFunction
}

export class ViewRouter {
  private router = new Router<RouteHandler>()

  add(url: string, handler: RouteHandler) {
    this.router.add(url, handler)
  }

  dispatch(url: string, context: ViewRouteContext) {
    let route = this.router.route(url)
    if (!route) {
      context.next()
      return
    }
    let handler = route.value
    switch (context.type) {
      case 'express':
        handler({
          type: 'express',
          req: context.req,
          res: context.res,
          next: context.next,
          url: url,
          params: route.params,
          query: route.query,
        }, view => {
          context.res.send(toHTML(view))
        })
        break
      case 'liveview':
        handler({
          type: 'liveview',
          session: context.session,
          url: url,
          query: route.query,
          params: route.params,
        }, view => {
          context.session.sendComponent(view)
        })
        break
      default: {
        let c: never = context
        let type = (c as ViewRouteContext).type
        throw new Error('unsupported context type: ' + type)
      }
    }
  }

  createExpressMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      let url = req.url
      let route = this.router.route(url)
      if (!route) {
        next()
        return
      }
      route.value({
        type: 'express',
        req,
        res,
        next,
        url,
        params: route.params,
        query: route.query,
      }, view => {
        res.send(toHTML(view))
      })
    }
  }
}
