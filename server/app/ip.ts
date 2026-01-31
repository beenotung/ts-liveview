import { find, update } from 'better-sqlite3-proxy'
import { proxy } from '../../db/proxy.js'
import { debugLog } from '../debug.js'
import { hashText } from '../hash.js'
import { env } from '../env.js'
import { Request } from 'express'

let log = debugLog('ip')
log.enabled = true

function isLocalAddress(ip: string): boolean {
  switch (ip) {
    case 'localhost':
    case '127.0.0.1':
    case '::1':
    case '::ffff:127.0.0.1':
      return true
    default:
      if (ip.startsWith('127.')) return true
      if (ip.startsWith('192.168.')) return true
      if (ip.startsWith('10.')) return true
      if (ip.startsWith('169.254.')) return true
      if (ip.startsWith('fe80::')) return true
      // Check for 172.16.0.0 to 172.31.255.255 (private network)
      if (ip.startsWith('172.')) {
        let parts = ip.split('.')
        if (parts.length >= 2) {
          let secondOctet = parseInt(parts[1], 10)
          if (secondOctet >= 16 && secondOctet <= 31) return true
        }
      }
      return false
  }
}

export async function getFindIPInfo(ip: string) {
  let url = `https://api.findip.net/${ip}/?token=${env.FIND_IP_API_KEY}`
  let res = await fetch(url)
  let info: Record<string, object> = await res.json()
  return info
}

export function getRequestIP(req: Request): string | null {
  // Try req.ip (set by Express with trust proxy)
  if (req.ip) return req.ip

  // Try x-forwarded-for header
  let x_forwarded_for = req.headers['x-forwarded-for']
  if (x_forwarded_for) {
    let ip = Array.isArray(x_forwarded_for)
      ? x_forwarded_for[0]
      : x_forwarded_for.split(',')[0]
    return ip?.trim() || null
  }

  // Try x-real-ip header (used by nginx)
  let x_real_ip = req.headers['x-real-ip']
  if (x_real_ip) {
    return Array.isArray(x_real_ip) ? x_real_ip[0] : x_real_ip
  }

  // Fallback to socket remote address
  return req.socket?.remoteAddress || null
}

export async function logIPInfo(ip: string, log_id: number) {
  // skip local addresses before making API call
  if (isLocalAddress(ip)) {
    log('skip local address')
    return
  }
  let info = await getFindIPInfo(ip)
  if (!info) {
    log('no ip info resolved')
    return
  }
  let ids = store_parts(info)
  let geo_ip_id = store_ids(ids)
  update(proxy.request_log, log_id, { geo_ip_id })
}

let geo_ip_cache: Record<string, number> = Object.create(null)

function store_ids(ids: Record<string, number>): number {
  let json = JSON.stringify(ids)
  let id = geo_ip_cache[json]
  if (id) {
    return id
  }
  let hash = hashText(json)
  let row = find(proxy.geo_ip, { hash })
  if (row) {
    id = row.id!
  } else {
    id = proxy.geo_ip.push({ hash, content: json })
  }
  geo_ip_cache[json] = id
  return id
}

function store_parts(info: Record<string, object>) {
  let ids: Record<string, number> = {}
  for (let [key, value] of Object.entries(info)) {
    let part_id = store_part(value)
    ids[key] = part_id
  }
  return ids
}

let part_hash_cache: Record<string, number> = Object.create(null)

function store_part(part: object): number {
  let json = JSON.stringify(part)
  // FIXME use hash as key of cache to reduce memory usage
  // TODO cache json to hash with expire time to reduce memory usage
  let id = part_hash_cache[json]
  if (id) {
    return id
  }
  let hash = hashText(json)
  let row = find(proxy.geo_ip_parts, { hash })
  if (row) {
    id = row.id!
  } else {
    id = proxy.geo_ip_parts.push({ hash, content: json })
  }
  part_hash_cache[json] = id
  return id
}
