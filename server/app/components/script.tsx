import { config } from '../../config.js'
import JSX from '../jsx/jsx.js'
import { Raw } from './raw.js'
import * as minify from 'minify'
import { nodeToHTML } from '../jsx/html.js'

type MinifyType = {
  minify: {
    html(code: string): string
  }
}

export function Script(js: string) {
  const node = <script>{Raw(js)}</script>
  if ('not fixed') {
    return node
  }
  if (config.production) {
    // FIXME need to explicitly allow script tag
    const html = nodeToHTML(node, { type: 'static' })
    // TODO support async result
    return (minify as unknown as MinifyType).minify.html(html)
  }
  return node
}

/** @description semi-colon is mandatory */
export function aggressivelyTrimInlineScript(html: string): string {
  return html.replace(/ /g, '').replace(/\n/g, '')
}

export function MuteConsole() {
  const html = aggressivelyTrimInlineScript(/* html */ `
<script>
  console.original_debug = console.debug;
  console.debug = () => {}
</script>
`)
  return Raw(html)
}
