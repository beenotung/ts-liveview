import { marked } from 'marked'

export function markdownToHtml(text: string): string {
  return marked(text, {
    mangle: false,
    headerIds: false,
    headerPrefix: undefined,
  })
}
