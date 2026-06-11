import type { Context, StaticContext } from '../context'
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
import { renderError, renderErrorNode, showError } from '../components/error.js'
import { EarlyTerminate, ErrorNode, MessageException } from '../../exception.js'
import { evalLocale } from '../components/locale.js'

const log = debug('html.ts')
log.enabled = true

/**
 * only use for textContent, not attribute values
 */
export function escapeHTMLTextContent(str: string): string {
  str = str.replace(/&/g, '&amp;')
  str = str.replace(/</g, '&lt;')
  str = str.replace(/>/g, '&gt;')
  return str
}

export function escapeHTMLAttributeValue(
  value: string | number | boolean,
): string {
  let type = typeof value
  let str = String(value)
  if (type === 'number' || type === 'boolean') {
    return str
  }
  // using replace with /g is 8-10% faster than replaceAll
  str = str.replace(/&/g, '&amp;')
  str = str.replace(/</g, '&lt;')
  str = str.replace(/>/g, '&gt;')
  str = str.replace(/"/g, '&quot;')
  str = str.replace(/'/g, '&#39;')
  return `"${str}"`
}

// to be used in template that has already wrapped the attribute value in double quotes
export function unquote(str: string): string {
  return str.slice(1, str.length - 1)
}

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

export function prerender(
  node: Node,
  context: Context | Omit<StaticContext, 'type'> = {
    type: 'static',
    language: 'en',
  },
): Raw {
  if (!('type' in context)) {
    context = { type: 'static', ...context }
  }
  let html = nodeToHTML(node, context)
  return ['raw', html]
}

export function writeNode(
  stream: HTMLStream,
  node: Node,
  context: Context,
): void {
  // Literal
  switch (node) {
    case null:
    case undefined:
    case false:
    case true:
      return
  }
  switch (typeof node) {
    case 'string':
      return stream.write(escapeHTMLTextContent(node))
    case 'number':
      return stream.write(String(node))
  }

  node satisfies Array<unknown>

  // Non-Array (unexpected Node Type)
  if (!Array.isArray(node)) {
    node satisfies never
    let type = Object.prototype.toString.call(node)
    if (type === '[object Object]' && 'constructor' in node) {
      type = '[object ' + (node as object).constructor.name + ']'
    }
    throw new TypeError('unexpected node type: ' + type)
  }

  // Empty NodeList (should not happen)
  if (!node.length) {
    // Likely caused by using .map() without wrapping in tuple, or not using mapArray()
    return
  }

  // Element
  if (
    node.length <= 3 &&
    typeof node[0] === 'string' &&
    // typeof node[1] !== 'string'
    (node[1] === undefined || (node[1] !== null && typeof node[1] === 'object'))
  ) {
    node satisfies Element
    return writeElement(stream, node, context)
  }

  // JSXFragment
  if (
    node.length === 3 &&
    node[0] === undefined &&
    node[1] === null &&
    Array.isArray(node[2])
  ) {
    node satisfies JSXFragment
    return writeNodeList(stream, node[2], context)
  }

  // Component
  if (node.length <= 3 && typeof node[0] === 'function') {
    node satisfies Component
    let componentFn = node[0]
    if (componentFn === Flush) {
      stream.flush()
      return
    }
    let attrs = node[1] || {}
    let children = node[2]
    if (children) {
      Object.assign(attrs, { children })
    }
    try {
      node = componentFn(attrs, context)
      writeNode(stream, node, context)
    } catch (error) {
      writeError(stream, error, context)
    }
    return
  }

  // Raw
  if (node.length === 2 && node[0] === 'raw' && typeof node[1] === 'string') {
    node satisfies Raw
    return stream.write(node[1])
  }

  // Fragment
  if (node.length === 1 && Array.isArray(node[0])) {
    node as Fragment
    return writeNodeList(stream, node[0], context)
  }

  // NodeList (fallback)
  // NodeList is not designed as a member of Node type because it can be indistinguishable from Element expression.
  // We try to resolve it in best-effort, in case the developer or ai agent don't know it should be wrapped in a tuple as Fragment.
  // @ts-expect-error
  node satisfies NodeList
  return writeNodeList(stream, node as NodeList, context)
}

function writeError(stream: HTMLStream, error: unknown, context: Context) {
  if (error === EarlyTerminate || error instanceof MessageException) throw error
  if (error instanceof ErrorNode) {
    writeNode(stream, renderErrorNode(error, context), context)
  } else {
    console.error('Caught error from componentFn:', error)
    if (context.type == 'ws') {
      context.ws.send(showError(error))
      throw EarlyTerminate
    }
    writeNode(stream, renderError(error, context), context)
  }
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
  let tagNameMatch = selector.match(tagNameRegex)
  if (!tagNameMatch) {
    throw new TypeError('failed to parse tag name, selector: ' + selector)
  }
  let tagName: string = tagNameMatch[1]
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
      value = evalLocale(value, context)
      if (value === undefined || value === null || value === false) return
      if (value === '' || value === true) {
        html += ` ${name}`
      } else {
        value = escapeHTMLAttributeValue(value)
        html += ` ${name}=${value}`
      }
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
    case 'link':
    case 'base':
    case 'source':
    case 'track':
    case 'col':
    case 'param':
    case 'area':
      return
  }
  try {
    if (children) {
      writeNodeList(stream, children, context)
    }
  } catch (error) {
    writeError(stream, error, context)
  } finally {
    stream.write(`</${tagName}>`)
  }
}

export function flagsToClassName(flags: Record<string, boolean>): string {
  let classes: string[] = []
  Object.entries(flags).forEach(([name, value]) => {
    if (value) {
      classes.push(name)
    }
  })
  return classes.join(' ')
}

export function concatClassNames(
  ...classNames: (string | null | undefined)[]
): string | undefined {
  let className = ''
  for (let name of classNames) {
    if (name) {
      className += ' ' + name
    }
  }
  className = className.trim()
  return className || undefined
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
