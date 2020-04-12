import S from 's-js'
import { Template, templateToHTML } from '../h'
import { ClientMessage } from '../types/message'
import { TemplateData } from '../types/view'

export function useClientMessage(f: (message: ClientMessage) => void) {
  return (message: string) => {
    f(JSON.parse(message))
  }
}

export function sampleTemplate(render: () => Template) {
  return S.sample(() => templateToHTML(render()))
}

type UrlPattern = {
  match: (url: string) => object | null
}
export type UrlPatternMatch = [UrlPattern, (p: any) => TemplateData]

export function matchUrlPattern(
  matches: UrlPatternMatch[],
  url: string,
): TemplateData | undefined {
  for (const [pattern, render] of matches) {
    const p = pattern.match(url)
    if (p) {
      return render(p)
    }
  }
}
