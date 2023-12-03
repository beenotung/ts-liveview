import type { ServerMessage } from '../../client/types'
import type express from 'express'
import { Node } from './jsx/types'

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
