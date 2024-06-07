import type { ServerMessage } from '../../client/types'
import type express from 'express'
import { Node } from './jsx/types'
import type { RouteParameters } from './utils/params'

export class MessageException {
  constructor(public message: ServerMessage) {}
}

export class ErrorNode {
  constructor(public node: Node) {}
}

/**
 * @description To quickly stop nested VNode traversal
 *  */
export const EarlyTerminate = 'EarlyTerminate' as const

/**
 * @alias {EarlyTerminate}
 *  */
export const Done = EarlyTerminate

export function toAbsoluteHref(req: express.Request, href: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href
  }
  if (!req.headers.host) {
    throw new Error('missing req.headers.host')
  }
  if (!href.startsWith('/')) {
    let parts = req.originalUrl.split('/')
    parts[parts.length - 1] = href
    href = parts.join('/')
  }
  return req.protocol + '://' + req.headers.host + href
}

export function setNoCache(res: express.Response) {
  res.removeHeader('ETag')
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, post-check=0, pre-check=0',
  )
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')
}

type FormBody = Record<string, string[] | string>

export function getStringCasual(body: FormBody | unknown, key: string): string {
  if (!body || typeof body !== 'object') return ''
  let value = (body as FormBody)[key]
  return typeof value === 'string' ? value : ''
}

export function toRouteUrl<R extends object, K extends string & keyof R>(
  /** @description for type inference */
  routes: R,
  /** @description the url template */
  key: K,
  /** @description the variables in url */
  options?: {
    params?: RouteParameters<K>
    query?: object
    /** @description to apply `JSON.stringify()` on the result if enabled */
    json?: boolean
  },
): string {
  return toUrl<K>(key, options)
}

export function toUrl<K extends string>(
  /** @description the url template */
  key: K,
  /** @description the variables in url */
  options?: {
    params?: RouteParameters<K>
    query?: object
    /** @description to apply `JSON.stringify()` on the result if enabled */
    json?: boolean
  },
): string {
  let params = options?.params as Record<string, string | number>
  let url = key as string
  for (let part of url.split('/')) {
    if (part[0] == ':') {
      let key = part.slice(1)
      if (key.endsWith('?')) {
        key = key.slice(0, key.length - 1)
      }
      if (key in params) {
        url = url.replace('/' + part, '/' + params[key])
      } else {
        url = url.replace('/' + part, '')
      }
    }
  }

  if (options?.query) {
    let searchParams = new URLSearchParams()
    for (let [key, value] of Object.entries(options.query)) {
      if (Array.isArray(value)) {
        for (let val of value) {
          searchParams.append(key, val)
        }
      } else {
        searchParams.set(key, value)
      }
    }
    url += '?' + searchParams
  }
  if (options?.json) {
    return JSON.stringify(url)
  }
  return url
}
