
import S from 's-js'
import { IPrimusOptions } from 'typestub-primus'
import { Component } from '../h'
import { viewToHTML } from '../h-client'
import { PrimitiveView, View } from '../types/view'
import { minify } from './minify'

export function sampleView(render: () => View) {
  return S.sample(() => {
    const view = render()
    const html = viewToHTML(view, new Map())
    return html
  })
}

type UrlPattern = {
  match: (url: string) => object | null
}
export type UrlPatternMatch = [UrlPattern, (p: any) => View]

export function matchUrlPattern(
  matches: UrlPatternMatch[],
  url: string,
): View | undefined {
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

export function sampleInSRoot<T>(f: () => T): T {
  return S.root(dispose => {
    const result = S.sample(() => f())
    dispose()
    return result
  })
}
