import type { children, Raw, VNode, VNodeList } from '../client/dom'
import { tagNameRegex } from '../client/dom.js'
import escapeHTML from 'escape-html'

export function VNodeToString([selector, attrs, children]: VNode): string {
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
  if (children) {
    children.forEach(child => (html += childToString(child)))
  }
  html += `</${tagName}>`
  return html
}

export function childToString(child: children[number]): string {
  if (typeof child === 'string') {
    return escapeHTML(child)
  }
  if (child[0] === 'raw') {
    return (child as Raw)[1]
  }
  if (child[1] === 'list') {
    let html = ''
    ;(child as VNodeList)[1].forEach(child => (html += childToString(child)))
    return html
  }
  return VNodeToString(child as VNode)
}
