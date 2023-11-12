import { Formidable, Part } from 'formidable'
import { config } from '../config.js'
import { existsSync, mkdirSync } from 'fs'
import { randomUUID } from 'crypto'
import { KB } from '@beenotung/tslib/size.js'
import { extname, join } from 'path'

const maxTrial = 10

const uploadDir = config.upload_dir

mkdirSync(uploadDir, { recursive: true })

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

export function createUploadForm(options: {
  mimeTypeRegex: RegExp
  maxFileSize?: number // default 300KB (per file)
  maxFiles?: number // default 1 (single file)
}) {
  let form = new Formidable({
    uploadDir,
    maxFileSize: options.maxFileSize || 300 * KB,
    maxFiles: options.maxFiles || 1,
    multiples: true,
    filename(name, ext, part, _form): string {
      let extname = detectExtname(part)
      for (let i = 0; i < maxTrial; i++) {
        let filename = randomUUID() + '.' + extname
        if (existsSync(join(uploadDir, filename))) continue
        return filename
      }
      throw new Error('too many files in uploadDir')
    },
    filter(part): boolean {
      return !!part.mimetype && options.mimeTypeRegex.test(part.mimetype)
    },
  })
  return form
}
