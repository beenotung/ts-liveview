import qs from 'querystring'
import S from 's-js'
import { viewToHTML } from '../h-client'
import { ClientMessage } from '../types/message'
import { View } from '../types/view'

export function useClientMessage(f: (message: ClientMessage) => void) {
  return (message: string) => {
    f(JSON.parse(message))
  }
}

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

export function parseQuery(query: string | any): any {
  if (typeof query === 'string') {
    return qs.parse(query)
  }
  return query
}
