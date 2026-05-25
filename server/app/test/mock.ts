import { Server } from 'ws'
import { ManagedWebsocket } from '../../ws/wss.js'
import { ExpressContext, WsContext } from '../context.js'
import { Session } from '../session.js'
import sinon from 'sinon'
import type { Request, Response } from 'express'
import type { WebSocket } from 'ws'
import { getSecureCookies, ws_cookies } from '../cookie.js'

export function mockContext(_args?: {
  url?: string
  language?: string
  args?: unknown[]
}) {
  let args = { url: '/', ..._args }
  let url = args.url
  let request = mockRequest({ url })
  let session = mockSession({ url, request, language: args.language })
  let context: WsContext = {
    type: 'ws',
    url,
    session,
    ws: session.ws,
    args: args?.args,
  }
  return context
}

export function mockAjaxContext(_args?: {
  url?: string
  language?: string
  query?: Record<string, string>
  body?: object
}) {
  let args = { url: '/', ..._args }
  let url = args.url
  let request = mockRequest(args)
  let context: ExpressContext = {
    type: 'express',
    url,
    req: request,
    res: request.res!,
    next: sinon.fake() as () => any,
  }
  return context
}

function mockSession(args: {
  url: string
  request: Request
  language?: string
}): Session {
  return {
    ws: mockWs(args),
    language: args.language,
    timeZone: 'Asia/Hong_Kong',
    timezoneOffset: -8 * 60,
    url: args.url,
    onCloseListeners: [],
  }
}

function mockWs(args: { request: Request }): ManagedWebsocket {
  let { request } = args
  let cookies = getSecureCookies(request)
  let ws = {} as WebSocket
  ws_cookies.set(ws, cookies)
  return {
    ws,
    wss: {} as Server,
    request,
    session_id: '1',
    send: sinon.fake(),
    close: sinon.fake(),
  }
}

function mockRequest(args: {
  url: string
  query?: Record<string, string>
  body?: object
}): Request {
  let req = {} as Request
  req.url = args.url!
  req.cookies = {}
  req.signedCookies = {}
  req.headers = {}
  req.query = args.query || {}
  req.body = args.body || {}
  req.res = mockResponse()

  return req
}

function mockResponse() {
  let res = {} as Response
  res.json = sinon.fake()
  res.status = sinon.fake()
  res.cookie = sinon.fake()
  return res
}

export function mockMethod<T>(object: T, method: keyof T) {
  let fake = sinon.fake()
  let original = object[method]
  object[method] = fake as any
  function restore() {
    object[method] = original
  }
  return { fake, restore }
}

export function mockStderr() {
  return mockMethod(process.stderr, 'write')
}
