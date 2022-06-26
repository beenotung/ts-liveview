import { config } from '../../config.js'
import { o } from '../jsx/jsx.js'
import * as minify from 'minify'
import type { Element, Raw } from '../jsx/types'

type MinifyType = {
  minify: {
    html(code: string): Promise<string>
  }
}

const cache = new Map<string, string>()

export function Script(js: string): Element {
  if (config.production) {
    if (cache.has(js)) {
      js = cache.get(js) as string
    } else {
      cache.set(js, js)
      const p = (minify as unknown as MinifyType).minify.html(js)
      p.then(code => {
        cache.set(js, code)
        raw[1] = code
      }).catch(error => {
        console.error('failed to minify js:', { error, js })
      })
    }
  }
  const raw: Raw = ['raw', js]
  const node = <script>{raw}</script>
  return node
}

/** @description semi-colon is mandatory */
export function aggressivelyTrimInlineScript(html: string): string {
  return html.replace(/ /g, '').replace(/\n/g, '')
}

export const MuteConsole = Script(`
console.original_debug = console.debug;
console.debug = () => {};
`)
