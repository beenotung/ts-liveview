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
  arr: [key, Routes<T> | T][]
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

export interface Context<T, P = any, Q = any> {
  value: T
  params: P
  query: Q
}

export class Router<T> {
  private routes: Routes<T> = Routes()

  add(path: string, value: T) {
    let parts = path.split('/')
    let next = this.routes
    for (let part of parts) {
      next = getOrAddNextPart(next, part) as Routes<T>
    }
    next.parts[''] = value
  }

  route(path: string): Context<T> | undefined {
    let parts = path.split('/')
    let partsAcc = toList(parts)

    // check for query

    let match = matchParts(this.routes, partsAcc, null)
    if (!match) {
      return NotFound
    }
    return {
      value: match.value,
      params: toParams(match.paramsAcc),
      query: {},
    }
  }
}

function getOrAddNextPart<T>(routes: Routes<T>, part: string): Routes<T> | T {
  if (part.startsWith(':')) {
    let key = part.substr(1)
    if (key in routes.params.dict) {
      return routes.params.dict[key]
    }
    let next = Routes<T>()
    routes.params.dict[key] = next
    routes.params.arr.push([key, next])
    return next
  }
  return routes.parts[part] || (routes.parts[part] = Routes())
}

type List<T> = [T, List<T> | null] | null

type ParamsAcc = List<[string, string]>

type PartsAcc = List<string>

function matchParts<T>(routes: Routes<T>, partsAcc: PartsAcc, paramsAcc: ParamsAcc): {
  value: T
  paramsAcc: ParamsAcc | null
} | undefined {
  if (!partsAcc) {
    if (!('' in routes.parts)) {
      return NotFound
    }
    return {
      value: routes.parts[''] as T,
      paramsAcc,
    }
  }
  let [part, parts] = partsAcc
  if (part in routes.parts) {
    return matchParts(
      routes.parts[part] as Routes<T>,
      parts,
      paramsAcc,
    )
  }

  // apply deep-first search
  for (let [key, next] of routes.params.arr) {
    let match = matchParts(
      next as Routes<T>,
      parts,
      [[key, part], paramsAcc],
    )
    if (match) {
      return match // return first matched route
    }
  }

  return NotFound
}

function toList<T>(array: T[]): List<T> {
  let acc: List<T> = null
  for (let i = array.length - 1; i >= 0; i--) {
    let element = array[i]
    acc = [element, acc]
  }
  return acc
}

function toParams(acc: ParamsAcc | null): Record<string, string> {
  let params: Record<string, string> = {}
  while (acc) {
    let [[key, value], next] = acc
    params[key] = value
    acc = next
  }
  return params
}
