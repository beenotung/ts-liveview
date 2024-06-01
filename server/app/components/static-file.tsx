import { basename, dirname } from 'path'
import { prerender } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { existsSync, readFileSync } from 'fs'

export function StaticFile(file: string) {
  return prerender(
    <p style="white-space:pre-wrap">
      {existsSync(file)
        ? readFileSync(file).toString()
        : `${basename(file)} file is missing. You can put it in the ${dirname(file)} directory`}
    </p>,
  )
}
