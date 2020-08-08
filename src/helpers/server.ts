import escapeHTML from 'escape-html'
import { IPrimusOptions, Primus } from 'typestub-primus'
import { Component, Dynamic } from '../h'
import { primitiveViewToHTML } from '../h-client'
import { PrimitiveView } from '../types/view'
import { minify } from './minify'
import { toHTML } from './render'

type UrlPattern = {
  match: (url: string) => object | null
}
export type UrlPatternMatch = [UrlPattern, (p: any) => Dynamic]

export function matchUrlPattern(
  matches: UrlPatternMatch[],
  url: string,
): Dynamic | undefined {
  for (const [pattern, render] of matches) {
    const p = pattern.match(url)
    if (p) {
      return render(p)
    }
  }
}

export function minifyView(view: PrimitiveView | Component) {
  const html = toHTML(view)
  return minify(html)
}

export function genPrimusScript(options?: IPrimusOptions) {
  const primusPath = options?.primusOptions?.pathname || '/primus'
  return `<script src="${primusPath}/primus.js"></script>`
}

export function genInlinePrimusScript(primus: Primus): string {
  return primus.library()
}

type TextView = PrimitiveView | TextView[]

/** escape html */
export function s(view: TextView): string {
  if (Array.isArray(view)) {
    return view.map(view => s(view)).join('')
  }
  const html = primitiveViewToHTML(view)
  return escapeHTML(html)
}
