import { highlight } from 'sugar-high'
import hljs from 'highlight.js/lib/core'
import hljs_markdown from 'highlight.js/lib/languages/markdown'
import hljs_javascript from 'highlight.js/lib/languages/javascript'
import { Raw } from './raw.js'
import { fullyEscapeHTMLAttributeValue } from '../jsx/html.js'
import Prism from 'prismjs'
import { readFileSync } from 'fs'

hljs.registerLanguage('markdown', hljs_markdown)
hljs.registerLanguage('javascript', hljs_javascript)

type ColorMode = 'light' | 'dark'
let colorMode = 'dark' satisfies ColorMode as ColorMode

let lightStyle = /* css */ `
/**
 * Types that sugar-high have:
 *
 * identifier
 * keyword
 * string
 * Class, number and null
 * sign
 * comment
 * jsxliterals
 */
:root {
  --sh-class: #ed29ad;
  --sh-identifier: #1886ee;
  --sh-sign: #8996a3;
  --sh-string: #134cb0;
  --sh-keyword: #dd00a9;
  --sh-comment: #098f13;
  --sh-jsxliterals: #3c3b41;
}
code.code-block {
  background-color: #fff;
  border: 1px solid #ddd;
}

/* reference: node_modules/highlight.js/styles/default.css */
/* original author: (c) Ivan Sagalaev <maniac@softwaremaniacs.org> */
code.code-block.hljs {
  background: #f3f3f3;
  color: #444;
}
.hljs-comment {
  color: #697070;
}
.hljs-punctuation,
.hljs-tag {
  color: #444a;
}
.hljs-tag .hljs-attr,
.hljs-tag .hljs-name {
  color: #444;
}
.hljs-attribute,
.hljs-doctag,
.hljs-keyword,
.hljs-meta .hljs-keyword,
.hljs-name,
.hljs-selector-tag {
  font-weight: 700;
}
.hljs-deletion,
.hljs-number,
.hljs-quote,
.hljs-selector-class,
.hljs-selector-id,
.hljs-string,
.hljs-template-tag,
.hljs-type {
  color: #800;
}
.hljs-section,
.hljs-title {
  color: #800;
  font-weight: 700;
}
.hljs-link,
.hljs-operator,
.hljs-regexp,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-symbol,
.hljs-template-variable,
.hljs-variable {
  color: #ab5656;
}
.hljs-literal {
  color: #695;
}
.hljs-addition,
.hljs-built_in,
.hljs-bullet,
.hljs-code {
  color: #397300;
}
.hljs-meta {
  color: #1f7199;
}
.hljs-meta .hljs-string {
  color: #38a;
}
.hljs-emphasis {
  font-style: italic;
}
.hljs-strong {
  font-weight: 700;
}
`
let darkStyle = /* css */ `
/**
 * Types that sugar-high have:
 *
 * identifier
 * keyword
 * string
 * Class, number and null
 * sign
 * comment
 * jsxliterals
 */
:root {
  --sh-class: #B98EFF;
  --sh-identifier: #73b1d9;
  --sh-sign: #98a8b1;
  --sh-string: #709aff;
  --sh-keyword: #FF7DE9;
  --sh-comment: #098f13;
  --sh-jsxliterals: #d7d7db;
}
code.code-block {
  background-color: #232327;
  color: #eaeaea;
}
/* reference: node_modules/highlight.js/styles/tomorrow-night-bright.css */
code.code-block.hljs {
  background: #000;
  color: #eaeaea;
}
.hljs-comment,
.hljs-quote {
  color: #969896;
}
.hljs-deletion,
.hljs-name,
.hljs-regexp,
.hljs-selector-class,
.hljs-selector-id,
.hljs-tag,
.hljs-template-variable,
.hljs-variable {
  color: #d54e53;
}
.hljs-built_in,
.hljs-link,
.hljs-literal,
.hljs-meta,
.hljs-number,
.hljs-params,
.hljs-type {
  color: #e78c45;
}
.hljs-attribute {
  color: #e7c547;
}
.hljs-addition,
.hljs-bullet,
.hljs-string,
.hljs-symbol {
  color: #b9ca4a;
}
.hljs-section,
.hljs-title {
  color: #7aa6da;
}
.hljs-keyword,
.hljs-selector-tag {
  color: #c397d8;
}
.hljs-emphasis {
  font-style: italic;
}
.hljs-strong {
  font-weight: 700;
}
`

export let CodeBlockStyle = /* css */ `
code.code-block {
  padding: 0.25rem;
  border-radius: 0.25rem;
  white-space: pre-wrap !important;
  display: inline-block !important;
  max-width: 90vw;
}
${darkStyle}
${
  // colorMode === 'light' ? lightStyle : darkStyle
  readFileSync('node_modules/prismjs/themes/prism-tomorrow.css')
}
`

console.log(Object.keys(Prism.languages))

export function CodeBlock(attrs: {
  code: string
  style?: string
  language?: 'markdown' | 'javascript'
}) {
  let label = fullyEscapeHTMLAttributeValue(attrs.code)
  let className = 'code-block'
  let html: string
  if (attrs.language === 'markdown') {
    // className += ' hljs'
    // html = hljs.highlight(attrs.code, { language: attrs.language }).value
    // className += ' language-javascript'
    html = Prism.highlight(attrs.code, Prism.languages.markdown, 'markdown')
  } else {
    html = highlight(attrs.code)
  }
  let extraAttr = attrs.style ? ` style="${attrs.style}"` : ''
  return Raw(
    /* html */ `<code class="${className}" aria-label="${label}"${extraAttr}><span aria-hidden="true">${html}</span></code>`,
  )
}
