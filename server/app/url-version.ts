import { statSync } from 'fs'
import { join } from 'path'

let timestamps = new Map<string, number>()

/**
 * @description add search query to image url,
 * to force loading new version when the file is updated.
 * */
export function toVersionedUrl(pathname: string): string {
  if (!pathname || pathname[0] != '/' || pathname.includes('?')) return pathname
  let t = timestamps.get(pathname)
  if (!t) {
    try {
      let file = join('public', pathname)
      t = statSync(file).mtimeMs
      timestamps.set(pathname, t)
    } catch (error) {
      // file not found, incomplete sample data?
      return pathname
    }
  }
  return pathname + '?t=' + t
}

export function updateUrlVersion(url: string): string {
  let pathname = url.split('?')[0]
  let t = Date.now()
  timestamps.set(pathname, t)
  return pathname + '?t=' + t
}
