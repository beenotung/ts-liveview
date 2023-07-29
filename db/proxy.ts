import { proxySchema } from 'better-sqlite3-proxy'
import { db } from './db'

export type Method = {
  id?: null | number
  method: string
}

export type Url = {
  id?: null | number
  url: string
}

export type UaType = {
  id?: null | number
  name: string
  count: number
}

export type GeoIpParts = {
  id?: null | number
  hash: string
  content: string
}

export type GeoIp = {
  id?: null | number
  hash: string
  content: string
}

export type RequestSession = {
  id?: null | number
  language: null | string
  timezone: null | string
  timezone_offset: null | number
}

export type UaBot = {
  id?: null | number
  name: string
  count: number
}

export type UserAgent = {
  id?: null | number
  user_agent: string
  count: number
  ua_type_id: null | number
  ua_type?: UaType
  ua_bot_id: null | number
  ua_bot?: UaBot
}

export type UaStat = {
  id?: null | number
  last_request_log_id: number
}

export type User = {
  id?: null | number
  username: string
  password_hash: null | string // char(60)
  email: null | string
  tel: null | string
  avatar: null | string
}

export type RequestLog = {
  id?: null | number
  method_id: number
  method?: Method
  url_id: number
  url?: Url
  user_agent_id: null | number
  user_agent?: UserAgent
  geo_ip_id: null | number
  geo_ip?: GeoIp
  request_session_id: null | number
  request_session?: RequestSession
  user_id: null | number
  user?: User
  timestamp: number
}

export type ErrorLog = {
  id?: null | number
  timestamp: number
  title: string
  error: string
  client_url_id: number
  client_url?: Url
  api_url_id: number
  api_url?: Url
  request_log_id: number
  request_log?: RequestLog
}

export type DBProxy = {
  method: Method[]
  url: Url[]
  ua_type: UaType[]
  geo_ip_parts: GeoIpParts[]
  geo_ip: GeoIp[]
  request_session: RequestSession[]
  ua_bot: UaBot[]
  user_agent: UserAgent[]
  ua_stat: UaStat[]
  user: User[]
  request_log: RequestLog[]
  error_log: ErrorLog[]
}

export let proxy = proxySchema<DBProxy>({
  db,
  tableFields: {
    method: [],
    url: [],
    ua_type: [],
    geo_ip_parts: [],
    geo_ip: [],
    request_session: [],
    ua_bot: [],
    user_agent: [
      /* foreign references */
      ['ua_type', { field: 'ua_type_id', table: 'ua_type' }],
      ['ua_bot', { field: 'ua_bot_id', table: 'ua_bot' }],
    ],
    ua_stat: [],
    user: [],
    request_log: [
      /* foreign references */
      ['method', { field: 'method_id', table: 'method' }],
      ['url', { field: 'url_id', table: 'url' }],
      ['user_agent', { field: 'user_agent_id', table: 'user_agent' }],
      ['geo_ip', { field: 'geo_ip_id', table: 'geo_ip' }],
      ['request_session', { field: 'request_session_id', table: 'request_session' }],
      ['user', { field: 'user_id', table: 'user' }],
    ],
    error_log: [
      /* foreign references */
      ['client_url', { field: 'client_url_id', table: 'url' }],
      ['api_url', { field: 'api_url_id', table: 'url' }],
      ['request_log', { field: 'request_log_id', table: 'request_log' }],
    ],
  },
})
