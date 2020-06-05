import escapeHTML from 'escape-html'
import { ReactElement } from 'react'

export type Props = Record<string, any>

export type Node =
  | {
      type: 'element'
      tag: string
      props: null | Props
      children: Node[]
    }
  | {
      type: 'text'
      text: string
    }

function isEventPropName(name: string) {
  if (!name.startsWith('on')) {
    return false
  }
  const c = name[2]
  if (!c) {
    return false
  }
  return c === c.toUpperCase()
}

function propNameToHtml(name: string) {
  switch (name) {
    case 'className':
      return 'class'
    default:
      if (isEventPropName(name)) {
        return name.toLowerCase()
      }
      return name
  }
}

export function h(
  tag: string,
  props: null | Record<string, string | number>,
  ...children: Array<Node | string>
): Node {
  return {
    type: 'element',
    tag,
    props,
    children: children.map(node =>
      typeof node === 'string'
        ? {
            type: 'text',
            text: node,
          }
        : node,
    ),
  }
}

function propsToHtml(props: null | Props) {
  if (!props) {
    return ''
  }
  return Object.entries(props)
    .map(([key, value]) => {
      let name = propNameToHtml(key)
      name = escapeHTML(name)

      value = String(value)
      if (value === '') {
        // TODO auto fill value in some case
        // e.g. disabled="disabled" for IE?
        return name
      }
      value = JSON.stringify(value)
      return `${name}=${value}`
    })
    .join(' ')
}

export function renderToHtml(node: Node | ReactElement): string {
  node = node as Node
  switch (node.type) {
    case 'element':
      // TODO some tags should not have body
      // e.g. input, img, meta
      let props = propsToHtml(node.props)
      if (props.length > 0) {
        props = ' ' + props
      }
      const body = node.children.map(node => renderToHtml(node)).join('')
      return `<${node.tag}${props}>${body}</${node.tag}>`
    case 'text':
      return escapeHTML(node.text)
  }
}

export function renderOuter(node: Node | ReactElement, element: HTMLElement) {
  element.outerHTML = renderToHtml(node)
}

export function renderInner(node: Node | ReactElement, element: HTMLElement) {
  element.innerHTML = renderToHtml(node)
}
