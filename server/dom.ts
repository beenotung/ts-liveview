import type { VNode } from '../client/dom'
import { tagNameRegex } from '../client/dom.js'
import escapeHTML from 'escape-html'

export function VNodeToString([selector, attrs, children]: VNode): string {
  if (selector === 'raw') {
    return children ? children.join('') : ''
  }
  let tagName = selector.match(tagNameRegex)![1]
  let html = `<${tagName}`
  attrs?.forEach(([key, value]) => {
    value = JSON.stringify(value)
    html += ` ${key}=${value}`
  })
  html += `>`
  switch (tagName) {
    case 'img':
    case 'input':
    case 'br':
    case 'hr':
    case 'meta':
      return html
  }
  children?.forEach(child => {
    if (typeof child === 'string') {
      html += escapeHTML(child)
    } else {
      html += VNodeToString(child)
    }
  })
  html += `</${tagName}>`
  return html
}
