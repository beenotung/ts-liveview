import type { JSXFragment, Element, NodeList, attrs } from './types'

/**
 * @alias createElement
 * It can be specified in per-file basis: https://www.typescriptlang.org/tsconfig#jsxFactory
 */
export function o(
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
}

function fixProps(props: attrs) {
  if ('className' in props && !('class' in props)) {
    props.class = props.className
    delete props.className
  }
  if ('style' in props) {
    let style = props.style
    if (typeof style === 'string') {
      props.style = style.replace(/\s*\n\s*/g, ' ').trim()
    }
  }
  return props
}
