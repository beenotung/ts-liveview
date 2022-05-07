import escapeHTML from 'escape-html'
import type { Context } from '../context'
import { ContextSymbol } from '../context.js'
import debug from 'debug'
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
import { HTMLStream, noop } from './stream.js'
import { Flush } from '../components/flush.js'

const log = debug('html.ts')
log.enabled = true

export function nodeToHTML(node: Node, context: Context): html {
  let html = ''
  let stream = {
    write: (chunk: html) => (html += chunk),
    flush: noop,
  }
  writeNode(stream, node, context)
  return html
}

export function nodeListToHTML(nodeList: NodeList, context: Context): html {
  let html = ''
  let stream = {
    write: (chunk: html) => (html += chunk),
    flush: noop,
  }
  nodeList.forEach(node => writeNode(stream, node, context))
  return html
}

export function prerender(node: Node): Raw {
  let html = nodeToHTML(node, { type: 'static' })
  return ['raw', html]
}

export function writeNode(
  stream: HTMLStream,
  node: Node,
  context: Context,
): void {
  switch (node) {
    case null:
    case undefined:
    case false:
    case true:
      return
  }
  switch (typeof node) {
    case 'string':
      return stream.write(escapeHTML(node))
    case 'number':
      return stream.write(String(node))
  }
  if (node[0] === 'raw') {
    return stream.write((node as Raw)[1])
  }
  if (Array.isArray(node[0])) {
    return writeNodeList(stream, (node as Fragment)[0], context)
  }

  node = node as JSXFragment
  if (!node[0] && !node[1]) {
    return writeNodeList(stream, node[2], context)
  }

  if (typeof node[0] === 'function') {
    node = node as Component
    let componentFn = node[0]
    if (componentFn === Flush) {
      stream.flush()
      return
    }
    let attrs = {
      [ContextSymbol]: context,
      ...node[1],
    }
    node = componentFn(attrs, node[2])
    return writeNode(stream, node, context)
  }

  return writeElement(stream, node, context)
}

function writeNodeList(
  stream: HTMLStream,
  nodeList: NodeList,
  context: Context,
): void {
  nodeList.forEach(node => writeNode(stream, node, context))
}

const tagNameRegex = /([\w-]+)/
const idRegex = /#([\w-]+)/
const attrListRegex = /\[(.*?)\]/g
const classListRegex = /\.([\w-]+)/g

function writeElement(
  stream: HTMLStream,
  [selector, attrs, children]: Element,
  context: Context,
): void {
  let tagName = selector.match(tagNameRegex)![1]
  let html = `<${tagName}`
  let idMatch = selector.match(idRegex)
  if (idMatch) {
    selector = selector.replace(idMatch[0], '')
    html += ` id="${idMatch[1]}"`
  }
  for (let attrMatch of selector.matchAll(attrListRegex)) {
    selector = selector.replace(attrMatch[0], '')
    html += ` ${attrMatch[1]}`
  }
  let classList: string[] = []
  for (let classMatch of selector.matchAll(classListRegex)) {
    classList.push(classMatch[1])
  }
  if (classList.length > 0) {
    html += ` class="${classList.join(' ')}"`
  }
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
  stream.write(html)
  switch (tagName) {
    case 'img':
    case 'input':
    case 'br':
    case 'hr':
    case 'meta':
      return
  }
  if (children) {
    writeNodeList(stream, children, context)
  }
  stream.write(`</${tagName}>`)
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

// omit style-name conversion, use it as-is
export function inlineStyle(styles: Record<string, string | number>): string {
  return Object.entries(styles)
    .map(([name, value]) => name + ':' + value)
    .join(';')
}

// compatible with React-style camelCase object
export function inlineCamelCaseStyle(
  styles: Record<string, string | number>,
): string {
  return Object.entries(styles)
    .map(([name, value]) => toStyleName(name) + ':' + value)
    .join(';')
}

function toStyleName(name: string): string {
  name.match(/[A-Z]/g)?.forEach(char => {
    name = name.replace(char, '-' + char.toLowerCase())
  })
  return name
}
