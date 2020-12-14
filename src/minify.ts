import debug from 'debug'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { extname, join } from 'path'

const log = debug('minify')

type minify_fn = (code: string) => string

function repeat_fn(minify: minify_fn): minify_fn {
  return (code: string): string => {
    for (;;) {
      const min = minify(code)
      if (min === code) {
        return code
      }
      code = min
    }
  }
}

export let minify = {
  js: repeat_fn(require('minify/lib/js')),
  css: repeat_fn(require('minify/lib/css')),
  html: repeat_fn(require('minify/lib/html')),
  json: minify_json,
}
export type minify_type = keyof typeof minify

function minify_json(code: string): string {
  return JSON.stringify(JSON.parse(code))
}

export function minify_file(
  file: string,
  ext: minify_type = getExt(file) as minify_type,
): void {
  const fn = minify[ext]
  if (!fn) {
    throw new Error(`unsupported ext: ${ext}, file: ${file}`)
  }
  let code = readFileSync(file, 'utf-8')
  try {
    const originalSize = code.length
    code = fn(code)
    const newSize = code.length
    const p =
      Math.floor(((originalSize - newSize) / originalSize) * 100 * 100) / 100
    log(`minify file: ${file} (saved ${p}%)`)
    writeFileSync(file, code)
  } catch (e) {
    console.error('failed to minify file:', file)
  }
}

function getExt(file: string): string {
  return extname(file).slice(1).toLowerCase()
}

export function minify_dir(dir: string) {
  const files = readdirSync(dir)
  for (let file of files) {
    file = join(dir, file)
    const stat = statSync(file)
    if (stat.isDirectory()) {
      minify_dir(file)
    } else if (stat.isFile()) {
      minify_file(file)
    }
  }
}
