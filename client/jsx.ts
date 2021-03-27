import { VNode, children } from './dom'

export const JSX = {
  createElement(
    tagName: string,
    attrs: { [id: string]: string } | null,
    ...children: children
  ): VNode {
    if (children.length === 0) {
      if (!attrs) {
        return [tagName]
      }
      return [tagName, Object.entries(attrs)]
    }
    return [tagName, attrs ? Object.entries(attrs) : undefined, children]
  },
}

export default JSX
