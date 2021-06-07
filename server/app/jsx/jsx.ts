import { JSXFragment, Element, NodeList, attrs } from './types'

export const JSX = {
  createElement(
    tagName: string,
    props: attrs | null,
    ...children: NodeList
  ): Element | JSXFragment {
    if (!tagName && !props) {
      return [undefined, null, children]
    }
    if (children.length === 0) {
      if (!props) {
        return [tagName]
      }
      return [tagName, props]
    }
    return [tagName, props || {}, children]
  },
}

export default JSX
