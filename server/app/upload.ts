import formidable from 'formidable'
import { config } from '../config.js'
import { existsSync, mkdirSync } from 'fs'
import { randomUUID } from 'crypto'
import { KB } from '@beenotung/tslib/size.js'
import { join } from 'path'

const maxTrial = 10

const uploadDir = config.upload_dir

mkdirSync(uploadDir, { recursive: true })

export function createUploadForm(options: {
  mimeTypeRegex: RegExp
  maxFileSize?: number // default 300KB in total
  maxFiles?: number // default 1
}) {
  let form = new formidable.Formidable({
    uploadDir,
    maxFileSize: options.maxFileSize || 300 * KB,
    maxFiles: options.maxFiles || 1,
    multiples: options.maxFiles! > 1,
    filename(name, ext, part, form): string {
      let extname = part.mimetype?.split('/').pop()
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
