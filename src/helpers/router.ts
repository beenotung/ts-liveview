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

  subRoute(subdir: string) {
    if (!(this.dir.endsWith('/') || subdir.startsWith('/'))) {
      subdir = '/' + subdir
    }
    let dir = this.dir + subdir
    let subRoute = new Route(dir)
    this.subRoutes.push(subRoute)
    return subRoute
  }

  private allRules(): Rule[] {
    let rules = this.rules.slice()
    for (let subRoute of this.subRoutes) {
      for (let rule of sub
        Route.allRules()) {
        rules.push(rule)
      }
    }
    return rules
  }

  createMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
    }
  }

  handleRoute(path:string) {
  }
}
function trimPath(path:string){
  if (path.startsWith('/')){return path}
  return  path
}

function test() {
  let app = Router()
  app.add('/profile/:user_id', context => {

  })
}
