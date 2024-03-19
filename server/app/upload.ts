import { Formidable, Part, Options } from 'formidable'
import { existsSync, mkdirSync } from 'fs'
import { randomUUID } from 'crypto'
import { extname, join } from 'path'
import { client_config } from '../../client/client-config.js'
import { env } from '../env.js'

const maxTrial = 10

let mkdirCache = new Set<string>()
function cached_mkdir(dir: string) {
  if (mkdirCache.has(dir)) {
    return
  }
  mkdirSync(dir, { recursive: true })
  mkdirCache.add(dir)
}

function detectExtname(part: Part): string {
  if (part.originalFilename) {
    let ext = extname(part.originalFilename)
    if (ext[0] == '.') {
      ext = ext.slice(1)
    }
    if (ext) return ext
  }
  let mime = part.mimetype
  if (mime?.includes('text/plain')) return 'txt'
  return mime?.split('/').pop()?.split(';')[0] || 'bin'
}

export let MimeTypeRegex = {
  any_image: /^image\/.+/,
}

export function createUploadForm(options?: {
  /** @default config.upload_dir */
  uploadDir?: string

  /** @default any_image */
  mimeTypeRegex?: RegExp

  /** @default client_config.max_image_size */
  maxFileSize?: number

  /** @default 1 (single file) */
  maxFiles?: number

  /** @default randomUUID + extname */
  filename?: string | Options['filename']
}) {
  let uploadDir = options?.uploadDir || env.UPLOAD_DIR
  let mimeTypeRegex = options?.mimeTypeRegex || MimeTypeRegex.any_image
  let maxFileSize = options?.maxFileSize || client_config.max_image_size
  let maxFiles = options?.maxFiles || 1

  const filename: string | Options['filename'] =
    options?.filename ||
    ((_name, _ext, part, _file): string => {
      let extname = detectExtname(part)
      for (let i = 0; i < maxTrial; i++) {
        let filename = randomUUID() + '.' + extname
        if (existsSync(join(uploadDir, filename))) continue
        return filename
      }
      throw new Error('too many files in uploadDir')
    })

  cached_mkdir(uploadDir)
  let form = new Formidable({
    uploadDir,
    maxFileSize,
    maxFiles,
    multiples: true,
    filename: typeof filename == 'string' ? () => filename : filename,
    filter(part): boolean {
      return !!part.mimetype && mimeTypeRegex.test(part.mimetype)
    },
  })
  return form
}

export function toUploadedUrl(
  url: string | undefined | null,
): string | undefined {
  if (!url) return undefined
  if (url.startsWith('https://')) return url
  if (url.startsWith('http://')) return url
  return '/uploads/' + url
}
