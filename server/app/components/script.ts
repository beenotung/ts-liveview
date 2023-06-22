import { config } from '../../config.js'
import type { Element, Raw } from '../jsx/types'
import * as esbuild from 'esbuild'

const cache = new Map<string, string>()

export function Script(js: string): Element {
  if (config.production) {
    if (cache.has(js)) {
      js = cache.get(js) as string
    } else {
      let code = esbuild.transformSync(js, {
        minify: true,
        loader: 'js',
        target: config.client_target,
      }).code
      cache.set(js, code)
      js = code
    }
  }
  const raw: Raw = ['raw', js]
  return ['script', undefined, [raw]]
}

// use iife (Immediately Invoked Function Expression) to avoid name clash with other parts of the page.
export function iife<F extends () => void>(fn: F): Element
export function iife<F extends (...args: any[]) => void>(
  fn: F,
  args: Parameters<F>,
): Element
export function iife<F extends (...args: any[]) => void>(
  fn: F,
  args?: Parameters<F>,
): Element {
  if (args && args.length > 0) {
    return Script(`(${fn}).apply(this,${JSON.stringify(args)})`)
  }
  return Script(`(${fn})()`)
}

/**
 * @description semi-colon is mandatory
 * @deprecated use esbuild directly instead
 * */
export function aggressivelyTrimInlineScript(html: string): string {
  return html.replace(/ /g, '').replace(/\n/g, '')
}

export const MuteConsole = Script(`
console.original_debug = console.debug;
console.debug = () => {};
`)
