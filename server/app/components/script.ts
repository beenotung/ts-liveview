import { config } from '../../config.js'
import type { Raw } from '../jsx/types'
import * as esbuild from 'esbuild'

const cache = new Map<string, string>()

function getScriptCallerLocation(): string | null {
  let stack = new Error().stack
  if (!stack) return null
  for (let line of stack.split('\n')) {
    if (
      line.includes('script.ts') ||
      line.includes('script.js') ||
      line.includes('node:internal')
    ) {
      continue
    }
    let match = line.match(/\((.+:\d+:\d+)\)|at (.+:\d+:\d+)/)
    if (match) {
      return (match[1] ?? match[2]).trim()
    }
  }
  return null
}

function enhanceScriptMinifyError(error: unknown): Error {
  // check if the error is thrown by esbuild, like
  if (!error || typeof error !== 'object' || !('errors' in error)) {
    return error instanceof Error ? error : new Error(String(error))
  }
  let esbuildErrors = (
    error as {
      errors: Array<{
        location?: { line?: number; column?: number; lineText?: string }
        text: string
      }>
    }
  ).errors
  let first = esbuildErrors[0]
  let loc = first?.location
  let caller = getScriptCallerLocation()
  let message = [
    'Script() inline JS minify failed',
    caller ? `called from ${caller}` : '',
    loc?.line ? `at inline script line ${loc.line}, column ${loc.column}` : '',
    loc?.lineText ? `  > ${loc.lineText.trim()}` : '',
    first?.text ?? '',
  ]
    .filter(Boolean)
    .join('\n')
  let wrapped = new Error(message)
  if (error instanceof Error) {
    wrapped.cause = error
  }
  return wrapped
}

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
  try {
    code = esbuild.transformSync(js, {
      minify: true,
      loader: 'js',
      target: config.client_target,
      sourcefile: '<Script() inline JS>',
    }).code
  } catch (error) {
    throw enhanceScriptMinifyError(error)
  }

  cache.set(js, code)
  return code
}

/**
 * @default 'no-minify' when not in production
 * @default 'minify' when in production
 */
export type ScriptFlag = 'no-minify' | 'minify'

/**
 * For static script. Minimize in production mode and memorized (cached).
 * Prefer defining at module top level (like Style) for multi-line scripts; single-line
 * value assignment (e.g. form.field.value=...) is fine inline.
 * Prefer over raw <script> tag for minification and caching; raw <script> also works.
 * @returns script element
 */
export function Script(js: string, flag?: ScriptFlag): Raw {
  if (flag == 'minify' || (flag != 'no-minify' && config.production)) {
    js = minify(js)
  }
  return ['raw', `<script>${js}</script>`]
}

export default Script

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
