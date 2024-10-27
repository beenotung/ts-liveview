import type { Node, Fragment, NodeList, JSXFragment } from '../jsx/types'

export function Fragment(nodeList: NodeList): Fragment {
  return [nodeList]
}

export function fragmentToText(node: JSXFragment): string {
  if (!Array.isArray(node)) {
    throw new Error('expect JSXFragment be array')
  }
  if (node[0] || node[1]) {
    throw new Error('expect JSXFragment without tag name nor attrs')
  }
  let children = node[2]
  if (!Array.isArray(children)) {
    throw new Error('expect JSXFragment with children')
  }
  if (children.length != 1 || typeof children[0] !== 'string') {
    throw new Error('expect JSXFragment with text child')
  }
  return children[0]
}

export function mapArray<T>(
  array: T[],
  fn: (item: T, index: number, array: T[]) => Node,
  separator?: Node,
): Fragment {
  if (separator) {
    let nodeList: Node[] = []
    array.forEach((item, index, array) =>
      nodeList.push(fn(item, index, array), separator),
    )
    nodeList.pop()
    return [nodeList]
  }
  return [array.map(fn)]
}
