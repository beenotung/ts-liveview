import type { Node, Fragment, NodeList } from '../jsx/types'

export function Fragment(nodeList: NodeList): Fragment {
  return [nodeList]
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
