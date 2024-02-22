import { config } from '../../config.js'
import type { Raw } from '../jsx/types'
import * as esbuild from 'esbuild'

const cache = new Map<string, string>()

/**
 * @param js javascript code without script tag
 * @returns minified javascript code
 * @description memorized (cached)
 */
function minify(js: string): string {
  let code = cache.get(js)
  if (typeof code === 'string') {
    return code
  }
  code = esbuild.transformSync(js, {
    minify: true,
    loader: 'js',
    target: config.client_target,
  }).code

  cache.set(js, code)
  return code
}

/**
 * @default 'no-minify' when not in production
 * @default 'minify' when in production
 */
export type ScriptFlag = 'no-minify' | 'minify'

/**
 * @description For static script.
 * Minimize in production mode and memorized (cached).
 * @returns script element
 */
export function Script(js: string, flag?: ScriptFlag): Raw {
  if (flag == 'minify' || (flag != 'no-minify' && config.production)) {
    js = minify(js)
  }
  return ['raw', `<script>${js}</script>`]
}

/**
 * @description use iife (Immediately Invoked Function Expression) to avoid name clash with other parts of the page.
 * */
export function iife<F extends () => void>(fn: F, flag?: ScriptFlag): Raw
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function iife<F extends (...args: any[]) => void>(
  fn: F,
  args: Parameters<F>,
  flag?: ScriptFlag,
): Raw
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function iife<F extends (...args: any[]) => void>(
  fn: F,
  args?: Parameters<F> | ScriptFlag,
  flag?: ScriptFlag,
): Raw {
  args
  if (typeof args == 'string') {
    flag = args
    args = undefined
  }
  if (args && args.length > 0) {
    let args_code = JSON.stringify(args)
    args_code = args_code.slice(1, args_code.length - 1)
    return Script(`(${fn})(${args_code})`, flag)
  }
  return Script(`(${fn})()`, flag)
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
