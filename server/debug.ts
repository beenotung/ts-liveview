import debug from 'debug'

export function debugLog(file: string) {
  return debug(`ts-liveview:` + file)
}
