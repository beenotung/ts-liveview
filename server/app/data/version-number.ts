import { mkdirSync, existsSync, readFileSync, writeFile, rename } from 'fs'
import { debugLog } from '../../debug.js'

mkdirSync('data', { recursive: true })

let log = debugLog('version-number.ts')
log.enabled = true

export function loadNumber(file: string): number {
  if (!existsSync(file)) {
    return 0
  }
  let text = readFileSync(file).toString()
  let num = parseInt(text)
  if (Number.isNaN(num)) {
    throw new Error(`Invalid number, file: ${file}, text: ${text}`)
  }
  return num
}

export function saveNumber(file: string, value: number) {
  const tmpfile = file + '.tmp.' + Math.random().toString(36).slice(2)
  writeFile(tmpfile, String(value), error => {
    if (error) {
      log('Failed to save number to temp file:', {
        tmpfile,
        file,
        value,
        error,
      })
    } else {
      let once = () =>
        rename(tmpfile, file, error => {
          if (!error) return
          if (error.code == 'EPERM') {
            setTimeout(once, 1000)
            return
          }
          log('Failed to commit number to file:', {
            tmpfile,
            file,
            value,
            error,
          })
        })
      once()
    }
  })
}
