import qs from 'querystring'

function decodeUrlSearch(url: string) {
  const search = url.replace('/?', '')
  return qs.decode(search)
}

export function getHash(url: string): string {
  const search = decodeUrlSearch(url)
  const hash = (search.hash as string) || '#/'
  return hash
}
