import type { JSXFragment, Element, NodeList, attrs } from './types'

export const JSX = {
  createElement(
    tagName: string,
    props: attrs | null,
    ...children: NodeList
  ): Element | JSXFragment {
    if (!tagName && !props) {
      // simplify JSXFragment
      return [undefined, null, children]
    }
    // skip empty fields
    if (children.length === 0) {
      if (!props) {
        return [tagName]
      }
      return [tagName, fixProps(props)]
    }
    return [tagName, props ? fixProps(props) : {}, children]
  },
}

function fixProps(props: attrs) {
  if ('className' in props && !('class' in props)) {
    props.class = props.className
    delete props.className
  }
  return props
}

export default JSX
