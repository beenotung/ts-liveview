import type { VNodeList } from '../../client/dom.js'

// alias as `<> ... </>`
export function Fragment(
  props?: { list?: VNodeList },
  children?: VNodeList,
): JSX.Element {
  let nodes: VNodeList = props?.list || children || []
  return [nodes] as any
}
