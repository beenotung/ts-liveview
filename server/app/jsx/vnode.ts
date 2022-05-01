/* for client side dynamic rendering */

import type { VElement, VNode, VNodeList } from '../../../client/jsx/types'
import type { Context } from '../context'
import { ContextSymbol } from '../context.js'
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
    node = componentToNode(node as Component, context) as Element | Component
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
  const childrenHTML: html = nodeListToHTML(children, context)
  const childrenRaw: Raw = ['raw', childrenHTML]
  const vElementWithRaw: VElement = [vElement[0], vElement[1], [childrenRaw]]
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
    node = componentToNode(node, context)
    return nodeToVNode(node, context)
  }

  return elementToVElement(node, context)
}

function componentToNode(component: Component, context: Context): Node {
  const attrs = {
    [ContextSymbol]: context,
    ...component[1],
  }
  return component[0](attrs, component[2])
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
