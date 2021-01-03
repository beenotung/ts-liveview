import { Handler, NextFunction, Request, Response } from 'express'
import { Router } from 'url-router.ts'
import { Component } from '../h'
import { LiveSession } from '../live-session'

export type ViewContext = ExpressContext | LiveviewContext
export type ExpressContext = {
  type: 'express'
  /* from Router.Context */
  url: string
  params: any
  search?: string
  hash: undefined
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
  search?: string
  hash?: string
  /* from LiveView.LiveSession */
  session: LiveSession
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
      session: LiveSession
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
            search: route.search,
            hash: undefined,
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
            params: route.params,
            search: route.search,
            hash: route.hash,
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
          search: route.search,
          hash: undefined,
        },
        view => {
          res.send(toHTML(view))
        },
      )
    }
  }
}
