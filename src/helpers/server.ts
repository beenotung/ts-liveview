import S from 's-js'
import { Template, templateToHTML } from '../h'
import { ClientMessage } from '../types/message'

export function useClientMessage(f: (message: ClientMessage) => void) {
  return (message: string) => {
    f(JSON.parse(message))
  }
}

export function sampleTemplate(render: () => Template) {
  return S.sample(() => templateToHTML(render()))
}
