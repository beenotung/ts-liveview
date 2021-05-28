import { VElement, VNodeList } from './dom'

export const JSX = {
  createElement(
    tagName: string,
    attrs: { [id: string]: string } | null,
    ...children: VNodeList
  ): VElement {
    if (children.length === 0) {
      if (!attrs) {
        return [tagName]
      }
      return [tagName, Object.entries(attrs)]
    }
    return [tagName, attrs ? Object.entries(attrs) : [], children]
  },
}

export default JSX
