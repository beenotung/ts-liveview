/* for client side dynamic rendering */

import type { VElement, VNode, VNodeList } from '../../../client/jsx/types'
import type { Context } from '../context'
import type {
  Component,
  Element,
  Fragment,
  html,
  JSXFragment,
  Node,
  NodeList,
  Raw,
} from './types'
import { nodeListToHTML } from './html.js'
import { Flush } from '../components/flush.js'
import { renderError } from '../components/error.js'
import { EarlyTerminate, MessageException } from '../helpers.js'

export function nodeToVElementOptimized(
  node: Element | Component,
  context: Context,
): VElement {
  if (
    !(
      Array.isArray(node) &&
      (typeof node[0] === 'string' || typeof node[0] === 'function')
    )
  ) {
    throw new TypeError('expect Element or Component, got Node')
  }
  while (typeof node[0] === 'function') {
    node = componentToVNode(node as Component, context) as Element | Component
    if (
      !(
        Array.isArray(node) &&
        (typeof node[0] === 'string' || typeof node[0] === 'function')
      )
    ) {
      throw new TypeError('expect Element or Component, got Node')
    }
  }
  node = node as Element
  const children = node[2]
  if (!children || children.length === 0) {
    // no children
    return nodeToVNode(node, context)
  }
  const vElement: VElement = nodeToVNode(node, context)
  let vChildren: VNodeList | undefined = undefined
  if (vElement[2]) {
    const childrenHTML: html = nodeListToHTML(vElement[2], context)
    const childrenRaw: Raw = ['raw', childrenHTML]
    vChildren = [childrenRaw]
  }
  const vElementWithRaw: VElement = [vElement[0], vElement[1], vChildren]
  const vElementSize = JSON.stringify(vElement).length
  const vElementWithRawSize = JSON.stringify(vElementWithRaw).length
  if (vElementSize > vElementWithRawSize) {
    return vElementWithRaw
  }
  return vElement
}

export function nodeToVNode(node: Element, context: Context): VElement
export function nodeToVNode(node: Node, context: Context): VNode
export function nodeToVNode(node: Node, context: Context): VNode {
  switch (node) {
    case null:
    case undefined:
      return node
    case true:
    case false:
      return null
  }
  switch (typeof node) {
    case 'string':
    case 'number':
      return node
  }
  if (node[0] === 'raw') {
    return node as Raw
  }
  if (Array.isArray(node[0])) {
    node = node as Fragment
    return [nodeListToVNodeList(node[0], context)]
  }

  node = node as JSXFragment
  if (!node[0] && !node[1]) {
    return [nodeListToVNodeList(node[2], context)]
  }

  if (typeof node[0] === 'function') {
    return componentToVNode(node, context)
  }

  return elementToVElement(node, context)
}

function componentToVNode(component: Component, context: Context): VNode {
  let componentFn = component[0]
  if (componentFn === Flush) {
    return null
  }
  let attrs = component[1] || {}
  let children = component[2]
  if (children) {
    Object.assign(attrs, { children })
  }
  try {
    let node = componentFn(attrs, context)
    return nodeToVNode(node, context)
  } catch (error) {
    if (error === EarlyTerminate || error instanceof MessageException)
      throw error
    console.error('Caught error from componentFn:', error)
    return renderError(error, context)
  }
}

function elementToVElement(element: Element, context: Context): VElement {
  let [selector, attrs, children] = element
  if (attrs && 'class' in attrs && !attrs.class) {
    delete attrs.class
  }
  if (!children) {
    if (!attrs) {
      return [selector]
    }
    return [selector, attrs]
  }
  return [selector, attrs, nodeListToVNodeList(children, context)]
}

function nodeListToVNodeList(nodeList: NodeList, context: Context): VNodeList {
  return nodeList.map(node => nodeToVNode(node, context))
}
