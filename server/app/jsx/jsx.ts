import { Element, NodeList, attrs } from './types'

export const JSX = {
  createElement(
    tagName: string,
    attrs: attrs | null,
    ...children: NodeList
  ): Element {
    if (children.length === 0) {
      if (!attrs) {
        return [tagName]
      }
      return [tagName, attrs]
    }
    return [tagName, attrs || {}, children]
  },
}

export default JSX
