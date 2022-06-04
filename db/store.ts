import { find } from 'better-sqlite3-proxy'
import { db } from './db.js'
import { proxy } from './proxy.js'

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
    proxy.user_agent.push({ user_agent })
  user_agent_cache.set(user_agent, id)
  return id
}

export function storeRequestLog(request: {
  method: string
  url: string
  user_agent: string | null
}) {
  let user_agent = request.user_agent
  proxy.request_log.push({
    method_id: getMethodId(request.method),
    url_id: getUrlId(request.url),
    user_agent_id: user_agent ? getUserAgentId(user_agent) : null,
    timestamp: Date.now(),
  })
}

let select_user_agent = db.prepare(/* sql */ `
select
  user_agent.user_agent
, count(*) as count
from user_agent
inner join request_log on request_log.user_agent_id = user_agent.id
group by user_agent.id
`)

export function getUserAgents(): Array<{ user_agent: string; count: number }> {
  return select_user_agent.all()
}
