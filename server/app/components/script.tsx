import JSX from '../jsx/jsx.js'
import { Raw } from './raw.js'
import minify from 'minify'
import { nodeToHTML } from '../jsx/html.js'

export function Script(js: string) {
  const node = <script>{Raw(js)}</script>
  if ('not fixed') {
    return node
  }
  if (process.env.NODE_ENV === 'production') {
    // FIXME need to explicitly allow script tag
    const html = nodeToHTML(node, { type: 'static' })
    return (minify as any).html(html)
  }
  return node
}
