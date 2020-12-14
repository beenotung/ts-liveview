import { Handler, NextFunction, Request, Response } from 'express'
import { Component } from '../../h'
import { Session } from '../../session'
import { Router } from '../router/core'

export type ViewContext = ExpressContext | LiveviewContext
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

export type RouteHandler = (
  context: ViewContext,
  cb: (view: Component) => void,
) => void
export type ViewRouteContext =
  | {
      type: 'express'
      req: Request
      res: Response
      next: NextFunction
      toHTML: (component: Component) => string
    }
  | {
      type: 'liveview'
      session: Session
      next: NextFunction
    }

export class ViewRouter {
  private router = new Router<RouteHandler>()

  add(url: string, handler: RouteHandler) {
    this.router.add(url, handler)
  }

  dispatch(url: string, context: ViewRouteContext) {
    const route = this.router.route(url)
    if (!route) {
      context.next()
      return
    }
    const handler = route.value
    switch (context.type) {
      case 'express':
        handler(
          {
            type: 'express',
            req: context.req,
            res: context.res,
            next: context.next,
            url,
            params: route.params,
            query: route.query,
          },
          view => {
            context.res.send(context.toHTML(view))
          },
        )
        break
      case 'liveview':
        handler(
          {
            type: 'liveview',
            session: context.session,
            url,
            query: route.query,
            params: route.params,
          },
          view => {
            context.session.sendComponent(view)
          },
        )
        break
      default: {
        const c: never = context
        const type = (c as ViewRouteContext).type
        throw new Error('unsupported context type: ' + type)
      }
    }
  }

  createExpressMiddleware(toHTML: (component: Component) => string): Handler {
    return (req: Request, res: Response, next: NextFunction) => {
      const url = req.url
      const route = this.router.route(url)
      if (!route) {
        next()
        return
      }
      route.value(
        {
          type: 'express',
          req,
          res,
          next,
          url,
          params: route.params,
          query: route.query,
        },
        view => {
          res.send(toHTML(view))
        },
      )
    }
  }
}
