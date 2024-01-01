import { marked } from 'marked'

export function markdownToHtml(text: string): string | Promise<string> {
  return marked(text)
}
