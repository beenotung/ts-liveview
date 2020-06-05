import debug from 'debug'
import qs from 'querystring'

const log = debug('app:location')

function decodeUrlSearch(url: string) {
  const search = url.replace('/?', '')
  const o = qs.decode(search)
  if (o) {
    Object.entries(o).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value = value.filter(s => s)
        if (value.length === 0) {
          delete o[key]
        } else if (value.length === 1) {
          o[key] = value[0]
        }
      }
    })
  }
  return o
}

function getHashFromSearch(search: any, defaultValue: string): string {
  let hash = search.hash
  if (Array.isArray(hash)) {
    hash = hash[hash.length - 1]
  }
  if (typeof hash === 'string' && hash) {
    return hash
  }
  return defaultValue
}

export function getHash(url: string): string {
  const search = decodeUrlSearch(url)
  const hash = getHashFromSearch(search, '#/')
  log('hash:', hash)
  if (hash.startsWith('#')) {
    return hash
  }
  return '#' + hash
}
