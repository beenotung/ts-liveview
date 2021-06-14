/* for client side dynamic rendering */

import type { VElement, VNode, VNodeList } from '../../../client/app/types'
import type { Context } from '../context'
import { ContextSymbol } from '../context.js'
import type {
  Component,
  Element,
  Fragment,
  JSXFragment,
  Node,
  NodeList,
  Raw,
} from './types'

export function nodeToVNode(node: Node, context: Context): VNode {
  switch (node) {
    case null:
    case undefined:
    case false:
    case true:
      return node
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
    node = node as Component
    let attrs = {
      [ContextSymbol]: context,
      ...node[1],
    }
    node = node[0](attrs, node[2])
    return nodeToVNode(node, context)
  }

  return elementToVElement(node, context)
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
