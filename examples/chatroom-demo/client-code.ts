import fs from 'fs'
import { Primus } from 'typestub-primus'
import { genClientCode, genInlinePrimusScript, minify } from '../../src'

export async function makeClientCode(primus: Primus) {
  const liveview_code = await genClientCode()
  const primus_code = genInlinePrimusScript(primus)
  let code = primus_code + '\n' + liveview_code
  fs.writeFileSync('client.cache.js', code)
  code = minify(code)
  fs.writeFileSync('client.cache-1.min.js', code)
  code = await require('minify')('client.cache-1.min.js')
  fs.writeFileSync('client.cache-2.min.js', code)
  return `<script>${code}</script>`
}
