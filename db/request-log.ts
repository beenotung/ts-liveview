import { find } from 'better-sqlite3-proxy'
import { proxy } from './proxy.js'
import { checkNewRequestLog } from './user-agent.js'
import type { Session } from '../server/app/session.js'

let method_cache = new Map<string, number>()
function getMethodId(method: string): number {
  let id = method_cache.get(method)
  if (id) return id
  id = find(proxy.method, { method })?.id || proxy.method.push({ method })
  method_cache.set(method, id)
  return id
}

let url_cache = new Map<string, number>()
function getUrlId(url: string): number {
  let id = url_cache.get(url)
  if (id) return id
  id = find(proxy.url, { url })?.id || proxy.url.push({ url })
  url_cache.set(url, id)
  return id
}

let user_agent_cache = new Map<string, number>()
function getUserAgentId(user_agent: string): number {
  let id = user_agent_cache.get(user_agent)
  if (id) return id
  id =
    find(proxy.user_agent, { user_agent })?.id ||
    proxy.user_agent.push({
      user_agent,
      ua_type_id: null,
      ua_bot_id: null,
      count: 0,
    })
  user_agent_cache.set(user_agent, id)
  return id
}

export function storeRequestLog(request: {
  method: string
  url: string
  user_agent: string | null
  session_id: number | null
}) {
  let user_agent = request.user_agent
  let log_id = proxy.request_log.push({
    method_id: getMethodId(request.method),
    url_id: getUrlId(request.url),
    user_agent_id: user_agent ? getUserAgentId(user_agent) : null,
    request_session_id: request.session_id,
    timestamp: Date.now(),
  })
  checkNewRequestLog(log_id)
}

export function newRequestSession() {
  let session_id = proxy.request_session.push({
    language: null,
    timezone: null,
    timezone_offset: null,
  })
  return session_id
}

export function updateRequestSession(id: number, session: Session) {
  let row = proxy.request_session[id]
  if (session.language != undefined) row.language = session.language
  if (session.timeZone != undefined) row.timezone = session.timeZone
  if (session.timezoneOffset != undefined)
    row.timezone_offset = session.timezoneOffset
}
