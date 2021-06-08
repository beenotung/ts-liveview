import { Fragment, Raw, VNode, attrs, VElement, VNodeList } from './types'

export function updateElement(element: VElement) {
  let selector = element[0]
  let e = document.querySelector(selector)
  if (!e) {
    console.error(
      'Failed to query selector when updateElement, selector:',
      selector,
    )
    throw new Error('Failed to query selector when updateElement')
  }
  mountElement(e, element)
}

function mountElement(e: Element, element: VElement) {
  let [selector, attrs, children] = element
  applySelector(e, selector)
  if (attrs) applyAttrs(e, attrs)
  if (children) {
    e.innerHTML = ''
    createChildren(e, children)
    let jsonSize = JSON.stringify(element).length
    let htmlSize = e.outerHTML.length
    console.debug({ jsonSize, htmlSize })
    console.debug('saved:', ((jsonSize / htmlSize) * 100).toFixed(2) + '%')
  } else {
    let jsonSize = JSON.stringify(element).length
    let htmlSize = e.outerHTML.length - e.innerHTML.length
    console.debug({ jsonSize, htmlSize })
    console.debug('saved:', ((jsonSize / htmlSize) * 100).toFixed(2) + '%')
  }
}

function createElement(element: VElement): Element {
  let [selector, attrs, children] = element
  let e = createElementBySelector(selector)
  if (attrs) applyAttrs(e, attrs)
  if (children) {
    createChildren(e, children)
  }
  return e
}

const tagNameRegex = /([\w-]+)/
const idRegex = /#([\w-]+)/
const classListRegex = /\.([\w-]+)/g

function createElementBySelector(selector: string): Element {
  let tagNameMatch = selector.match(tagNameRegex)
  if (!tagNameMatch) {
    console.error('Failed to parse tagName from selector, selector:', selector)
    throw new Error('Failed to parse tagName from selector')
  }
  let e = document.createElement(tagNameMatch[1])
  applySelector(e, selector)
  return e
}

function applySelector(e: Element, selector: string) {
  let idMatch = selector.match(idRegex)
  if (idMatch) {
    selector = selector.replace(idMatch[0], '')
    e.id = idMatch[1]
  }
  let classList: string[] = []
  for (let classMatch of selector.matchAll(classListRegex)) {
    classList.push(classMatch[1])
  }
  if (classList.length > 0 && e.className) {
    e.className = classList.join(' ')
  }
}

function applyAttrs(e: Element, attrs: attrs) {
  Object.entries(attrs).forEach(entry => {
    e.setAttribute(entry[0], entry[1])
  })
}

function createChildren(e: Element, children: VNodeList) {
  children.forEach(node => createChild(e, node))
}

function createChild(e: Element, node: VNode) {
  switch (node) {
    case null:
    case undefined:
    case false:
    case true:
      return
  }
  switch (typeof node) {
    case 'string':
      e.appendChild(document.createTextNode(node))
      return
    case 'number':
      e.appendChild(document.createTextNode(String(node)))
      return
  }
  if (node[0] === 'raw') {
    node = node as Raw
    e.appendChild(document.createRange().createContextualFragment(node[1]))
    return
  }
  if (Array.isArray(node[0])) {
    node = node as Fragment
    node[0].forEach(child => createChild(e, child))
    return
  }

  node = node as VElement
  e.appendChild(createElement(node))
}
