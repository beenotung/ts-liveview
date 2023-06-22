import { config } from '../../config.js'
import * as esbuild from 'esbuild'
import { Element, Raw } from '../jsx/types.js'

let cache = new Map<string, string>()

export function Style(css: string): Element {
  if (config.production) {
    if (cache.has(css)) {
      css = cache.get(css) as string
    } else {
      let code = esbuild.transformSync(css, {
        minify: true,
        loader: 'css',
        target: config.client_target,
      }).code
      cache.set(css, code)
      css = code
    }
  }
  const raw: Raw = ['raw', css]
  return ['style', undefined, [raw]]
}

export default Style
