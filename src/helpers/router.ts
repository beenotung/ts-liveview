import { Request, Response, NextFunction } from 'express'
import { Session } from '../session'

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
}

export function Router() {
  return new Route('/')
}

type Rule = {
  path: string,
  cb: (context: Context) => void
}

export class Route {
  private subRoutes: Route[] = []
  private rules: Rule[] = []

  constructor(
    public dir: string,
  ) {
  }

  add(path: string, cb: (context: Context) => void) {
    this.rules.push({ path, cb })
  }

  subRoute(subDir: string): Route {
    let dir = joinPath(this.dir, subDir)
    let subRoute = new Route(dir)
    this.subRoutes.push(subRoute)
    return subRoute
  }

  private allRules(): Rule[] {
    let rules = this.rules.slice()
    for (let subRoute of this.subRoutes) {
      for (let rule of subRoute.allRules()) {
        rules.push(rule)
      }
    }
    return rules
  }

  createMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {

    }
  }

  handleRoute(path: string) {
  }
}

type ParsedPath<Q extends object = any> = {
  segments: string[]
  query: Q
}

/**
 * path example:
 *    /post/:post_id/comments?page=2
 * */
function parsePath(path: string): ParsedPath {
  let [file, search] = path.split('?')
  let segments = file.split('/')
  let result: ParsedPath = {
    segments,
    query: {},
  }
  for (const kv of search.split('&')) {
    for (let [key, value] of kv.split('=')) {
      key = decodeURIComponent(key)
      value = decodeURIComponent(value)
      result.query[key] = value
    }
  }
  return result
}

function joinPath(a: string, b: string): string {
  if (a.endsWith('/') || b.startsWith('/')) {
    return a + b
  }
  return a + '/' + b
}

function test() {
  let app = Router()
  app.add('/profile/:user_id', context => {

  })
}

test()
