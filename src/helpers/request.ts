import { IncomingMessage } from 'http'

export function parseCookiesFromRequest(
  req: IncomingMessage,
  mode: 'json',
): object
export function parseCookiesFromRequest(
  req: IncomingMessage,
  mode?: 'params',
): URLSearchParams
export function parseCookiesFromRequest(
  req: IncomingMessage,
  mode?: any,
): object | URLSearchParams {
  const params = new URLSearchParams(req.headers.cookie)
  if (mode === 'json') {
    return paramsToJson(params)
  }
  return params
}

export function paramsToJson(params: URLSearchParams) {
  const result: any = {}
  params.forEach((value, key) => {
    if (!(key in result)) {
      result[key] = value
      return
    }
    const old = result[key]
    if (Array.isArray(old)) {
      old.push(value)
      return
    }
    result[key] = [old, value]
  })
  return result
}
