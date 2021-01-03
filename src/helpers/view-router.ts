import { Handler, NextFunction, Request, Response } from 'express'
import { Router } from 'url-router.ts'
import { Component } from '../h'
import { LiveSession } from '../live-session'

export type ViewContext<Session extends LiveSession> =
  | ExpressContext
  | LiveviewContext<Session>
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
export type LiveviewContext<Session extends LiveSession> = {
  type: 'liveview'
  /* from Router.Context */
  url: string
  params: any
  search?: string
  hash?: string
  /* from LiveView.LiveSession */
  session: Session
}

export type RouteHandler<Session extends LiveSession> = (
  context: ViewContext<Session>,
  cb: (view: Component) => void,
) => void
export type ViewRouteContext<Session extends LiveSession> =
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

export class ViewRouter<Session extends LiveSession> {
  private router = new Router<RouteHandler<Session>>()

  add(url: string, handler: RouteHandler<Session>) {
    this.router.add(url, handler)
  }

  dispatch(url: string, context: ViewRouteContext<Session>) {
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
        const type = (c as ViewRouteContext<Session>).type
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
