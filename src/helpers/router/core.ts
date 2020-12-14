const NotFound = undefined
type key = string

interface Routes<T> {
  parts: {
    [part: string]: Routes<T> | T
  }
  params: Params<T>
}

interface Params<T> {
  dict: {
    [key: string]: Routes<T> | T
  }
  arr: Array<[key, Routes<T> | T]>
}

function Routes<T>(): Routes<T> {
  return {
    parts: {},
    params: {
      dict: {},
      arr: [],
    },
  }
}

export interface RouteContext<T, P = any, Q = any> {
  value: T
  params: P
  query: Q
}

export class Router<T> {
  private routes: Routes<T> = Routes()

  add(url: string, value: T) {
    const parts = url.split('/')
    let next = this.routes
    for (const part of parts) {
      next = getOrAddNextPart(next, part) as Routes<T>
    }
    next.parts[''] = value
  }

  route(url: string): RouteContext<T> | undefined {
    const [path, search] = url.split('?')
    const parts = path.split('/')

    const query: object = {}
    if (search) {
      parseQuery(search, query)
    }

    const partsAcc = toList(parts)

    const match = matchParts(this.routes, partsAcc, null)
    if (!match) {
      return NotFound
    }
    return {
      value: match.value,
      params: toParams(match.paramsAcc),
      query,
    }
  }
}

function getOrAddNextPart<T>(routes: Routes<T>, part: string): Routes<T> | T {
  if (part.startsWith(':')) {
    const key = part.substr(1)
    if (key in routes.params.dict) {
      return routes.params.dict[key]
    }
    const next = Routes<T>()
    routes.params.dict[key] = next
    routes.params.arr.push([key, next])
    return next
  }
  return routes.parts[part] || (routes.parts[part] = Routes())
}

type List<T> = [T, List<T> | null] | null

type ParamsAcc = List<[string, string]>

type PartsAcc = List<string>

function matchParts<T>(
  routes: Routes<T>,
  partsAcc: PartsAcc,
  paramsAcc: ParamsAcc,
):
  | {
      value: T
      paramsAcc: ParamsAcc | null
    }
  | undefined {
  if (!partsAcc) {
    if (!('' in routes.parts)) {
      return NotFound
    }
    return {
      value: routes.parts[''] as T,
      paramsAcc,
    }
  }
  const [part, parts] = partsAcc
  if (part in routes.parts) {
    return matchParts(routes.parts[part] as Routes<T>, parts, paramsAcc)
  }

  // apply deep-first search
  for (const [key, next] of routes.params.arr) {
    const match = matchParts(next as Routes<T>, parts, [[key, part], paramsAcc])
    if (match) {
      return match // return first matched route
    }
  }

  return NotFound
}

function toList<T>(array: T[]): List<T> {
  let acc: List<T> = null
  for (let i = array.length - 1; i >= 0; i--) {
    const element = array[i]
    acc = [element, acc]
  }
  return acc
}

function toParams(acc: ParamsAcc | null): Record<string, string> {
  const params: Record<string, string> = {}
  while (acc) {
    const [[key, value], next] = acc
    params[key] = value
    acc = next
  }
  return params
}

function parseQuery(search: string, query: object): void {
  for (const kv of search.split('&')) {
    let [key, value] = kv.split('=')
    key = decodeURIComponent(key)
    value = decodeURIComponent(value)
    ; (query as any)[key] = value
  }
}
