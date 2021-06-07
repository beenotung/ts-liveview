import { Node, Fragment, NodeList } from '../jsx/types'

export function Fragment(nodeList: NodeList): Fragment {
  return [nodeList]
}

export function mapArray<T>(
  array: T[],
  fn: (item: T, index: number, array: T[]) => Node,
): Fragment {
  return [array.map(fn)]
}
