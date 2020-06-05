import escapeHTML from 'escape-html'
import S from 's-js'
import { IPrimusOptions, Primus } from 'typestub-primus'
import { Component, Dynamic } from '../h'
import { primitiveViewToHTML, viewToHTML } from '../h-client'
import { PrimitiveView, View } from '../types/view'
import { minify } from './minify'

export function sampleView(render: () => View) {
  return viewToHTML(sampleInSRoot(render), new Map())
}

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
  const html = viewToHTML(view, new Map())
  return minify(html)
}

export function genPrimusScript(options?: IPrimusOptions) {
  const primusPath = options?.primusOptions?.pathname || '/primus'
  return `<script src="${primusPath}/primus.js"></script>`
}

export function genInlinePrimusScript(primus: Primus): string {
  return primus.library()
}

export function sampleInSRoot<T>(f: () => T): T {
  return S.root(dispose => {
    const result = S.sample(() => f())
    dispose()
    return result
  })
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
