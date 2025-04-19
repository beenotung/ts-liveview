import type express from 'express'
import type { ManagedWebsocket } from '../ws/wss'
import type { RouteContext } from 'url-router.ts'
import type { Session } from './session'
import type { PageRoute } from './routes'
import { getContextCookies, setContextCookie } from './cookie.js'
import { EarlyTerminate, HttpError, MessageException } from '../exception.js'
import type { ServerMessage } from '../../client/types'
import { CookieOptions } from 'express'

export type Context = StaticContext | DynamicContext

export type StaticContext = {
  type: 'static'
  language: string
}

export type DynamicContext = ExpressContext | WsContext

export type ExpressContext = {
  type: 'express'
  req: express.Request
  res: express.Response
  next: express.NextFunction
} & RouterContext

export type WsContext = {
  type: 'ws'
  ws: ManagedWebsocket
  event?: string
  args?: unknown[]
  session: Session
} & RouterContext

export type RouterContext = {
  url: string
  routerMatch?: RouterMatch
}

export type RouterMatch = Omit<RouteContext<PageRoute>, 'value'>

export function toExpressContext(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  let context: ExpressContext = {
    type: 'express',
    req,
    res,
    next,
    url: req.url,
  }
  return context
}

export function getContextUrl(context: Context): string {
  if (context.type === 'static') {
    throw new Error('url is not supported in static context')
  }
  return context.url
}

export function castDynamicContext(context: Context): DynamicContext {
  if (context.type === 'static') {
    throw new Error(
      'Assertion failed, expect dynamic context, got static context',
    )
  }
  return context
}

export function getContextFormBody(context: Context): unknown | undefined {
  if (context.type === 'ws') {
    return context.args?.[0]
  }
  if (context.type === 'express') {
    return context.req.body
  }
}

type FormBody = Record<string, string[] | string>

export function getStringCasual(body: FormBody | unknown, key: string): string {
  if (!body || typeof body !== 'object') return ''
  let value = (body as FormBody)[key]
  return typeof value === 'string' ? value : ''
}

export function getId(body: FormBody | unknown, key: string): number {
  if (!body || typeof body !== 'object')
    throw new HttpError(400, 'missing form body')
  if (!(key in body)) throw new HttpError(400, 'missing ' + key)
  let value = +(body as FormBody)[key]
  if (!value) throw new HttpError(400, 'invalid ' + key)
  return value
}

export function getContextSearchParams(
  context: Context,
): URLSearchParams | undefined {
  let search =
    context.type == 'static' ? undefined : context.routerMatch?.search
  return new URLSearchParams(search)
}

export function getCookieLang(context: Context) {
  return getContextCookies(context)?.unsignedCookies.lang
}

export function setCookieLang(
  context: Context,
  lang: string,
  options?: CookieOptions,
) {
  setContextCookie(context, 'lang', lang, options)
}

export function getContextLanguage(context: Context): string | undefined {
  let lang = getCookieLang(context)
  if (lang) {
    return fixLanguage(lang)
  }
  if (context.type === 'static') {
    return fixLanguage(context.language)
  }
  if (context.type === 'ws') {
    return fixLanguage(context.session.language)
  }
  if (context.type === 'express') {
    // e.g. en-US,en;q=0.5
    let language =
      context.req.headers['accept-language'] ||
      context.req.headers['content-language']
    return fixLanguage(language?.split(',')[0])
  }
}

export function fixLanguage(language: string | undefined): string | undefined {
  if (!language || language === '*') {
    return
  }
  return language.replace('_', '-')
}

export function getContextTimezone(context: Context): string | undefined {
  if (context.type === 'ws') {
    return context.session.timeZone
  }
}

export function isAjax(context: Context): boolean {
  if (context.type !== 'express') return false
  let mode = context.req.header('Sec-Fetch-Mode')
  return mode != null && mode !== 'navigate'
}

export function throwIfInAPI(
  error: unknown,
  selector: string,
  context: Context,
) {
  let message: ServerMessage = [
    'batch',
    error instanceof MessageException
      ? [
          ['update-text', selector, ''],
          ['remove-class', selector, 'error'],
          error.message,
        ]
      : [
          ['update-text', selector, String(error)],
          ['add-class', selector, 'error'],
        ],
  ]
  if (context.type == 'ws') {
    context.ws.send(message)
    throw EarlyTerminate
  }
  if (context.type == 'express' && isAjax(context)) {
    context.res.json({ message })
    throw EarlyTerminate
  }
}
