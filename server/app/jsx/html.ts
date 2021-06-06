import escapeHTML from 'escape-html'
import type { Context } from '../context'
import { ContextSymbol } from '../context.js'
import type {
  html,
  Node,
  Raw,
  Fragment,
  NodeList,
  JSXFragment,
  Component,
  Element,
} from './types'

export const tagNameRegex = /([\w-]+)/

export function nodeToHTML(node: Node, context: Context): html {
  switch (node) {
    case null:
    case undefined:
    case false:
    case true:
      return ''
  }
  switch (typeof node) {
    case 'string':
      return escapeHTML(node)
    case 'number':
      return String(node)
  }
  if (node[0] === 'raw') {
    return (node as Raw)[1]
  }
  if (Array.isArray(node[0])) {
    return nodeListToHTML((node as Fragment)[0], context)
  }

  node = node as JSXFragment
  if (!node[0] && !node[1]) {
    return nodeListToHTML(node[2], context)
  }

  if (typeof node[0] === 'function') {
    node = node as Component
    let attrs = {
      [ContextSymbol]: context,
      ...node[1],
    }
    return nodeToHTML(node[0](attrs, node[2]), context)
  }

  return elementToHTML(node, context)
}

function nodeListToHTML(nodeList: NodeList, context: Context): html {
  let html = ''
  nodeList.forEach(node => (html += nodeToHTML(node, context)))
  return html
}

function elementToHTML(
  [selector, attrs, children]: Element,
  context: Context,
): html {
  let tagName = selector.match(tagNameRegex)![1]
  let html = `<${tagName}`
  if (attrs) {
    Object.entries(attrs).forEach(([name, value]) => {
      switch (name) {
        case 'class':
        case 'className':
        case 'style':
          if (!value) {
            return
          }
      }
      value = JSON.stringify(value)
      html += ` ${name}=${value}`
    })
  }
  html += '>'
  switch (tagName) {
    case 'img':
    case 'input':
    case 'br':
    case 'hr':
    case 'meta':
      return html
  }
  if (children) {
    children.forEach(node => (html += nodeToHTML(node, context)))
  }
  html += `</${tagName}>`
  return html
}

export function flagsToClassName(flags: Record<string, any>): string {
  let classes: string[] = []
  Object.entries(flags).forEach(([name, value]) => {
    if (value) {
      classes.push(name)
    }
  })
  return classes.join(' ')
}
