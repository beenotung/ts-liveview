import JSX from '../jsx/jsx.js'
import { Raw } from './raw.js'
import * as minify from 'minify'
import { nodeToHTML } from '../jsx/html.js'

export function Script(js: string) {
  if (process.env.NODE_ENV === 'production') {
    const html = nodeToHTML(<script>{Raw(js)}</script>, { type: 'static' })
    return (minify as any).html(html)
  }
  return <script>{Raw(js)}</script>
}
