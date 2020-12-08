interface Routes<T> {
  [path: string]: Routes<T> | T
}

export interface Context<T, P = any, Q = any> {
  value: T
  params: P
  query: Q
}

export class Router<T> {
  private routes: Routes<T> = {}

  add(path: string, value: T) {
    let parts = path.split('/')
    let next = this.routes
    for (let part of parts) {
      next = nextRoute(next, part) as Routes<T>
    }
    next[''] = value
  }

  route(path: string): Context<T> | undefined {
    let params: any = {}
    let parts = path.split('/')
    let next = this.routes
    for (let part of parts) {
      if (part in next) {
        next = next[part] as Routes<T>
      } else {
        return
      }
    }
    if (next && '' in next) {
      return {
        value: next[''] as T,
        params,
        query: {},
      }
    }
  }
}

function nextRoute<T>(routes: Routes<T>, part: string): Routes<T> | T {
  if (part in routes) {
    return routes[part]
  }
  return routes[part] = {}
}

