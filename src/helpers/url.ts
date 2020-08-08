import qs from 'querystring'

function parseUrlSearch(url: string) {
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

function parseHashFromSearchUrl(url: any, defaultValue: string): string {
  const search = parseUrlSearch(url)
  let hash = search.hash
  if (Array.isArray(hash)) {
    hash = hash[hash.length - 1]
  }
  if (typeof hash === 'string' && hash) {
    return hash
  }
  return defaultValue
}

export function parseHash(url: string): string {
  if (url.includes('?')) {
    url = parseHashFromSearchUrl(url, '#/')
  }
  if (url.startsWith('/#')) {
    url = url.substr(1)
  }
  if (!url.startsWith('#')) {
    url = '#' + url
  }
  return url
}
