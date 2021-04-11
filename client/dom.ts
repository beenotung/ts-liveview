export type VElement = [selector, attrs?, VNodeList?]
export type VNodeList = VNode[]
export type VNode = text | Raw | VFragment | VElement
export type Raw = ['raw', html]
export type VFragment = [VNodeList]
type html = string
type text = string | number
export type selector = string
export type attrs = [key, value][]
type key = string
type value = string

export function updateElement([selector, attrs, children]: VElement) {
  let e = document.querySelector(selector)
  if (!e) {
    console.error('Failed to lookup element to mountNode, selector:', selector)
    throw new Error('Failed to lookup element to mountNode')
  }
  mountElement(e, [selector, attrs, children])
}

export function mountElement(
  e: Element,
  [selector, attrs, children]: VElement,
) {
  let jsonSize = JSON.stringify([selector, attrs, children]).length
  applySelector(e, selector)
  setAttrs(e, attrs)
  e.innerHTML = ''
  createChildren(e, children)
  let htmlSize = e.outerHTML.length
  console.debug({ json: jsonSize, html: htmlSize })
}

function createElement([selector, attrs, children]: VElement): Element {
  let e = createElementBySelector(selector)
  setAttrs(e, attrs)
  createChildren(e, children)
  return e
}

function setAttrs(e: Element, attrs?: attrs) {
  if (attrs) {
    attrs.forEach(([key, value]) => {
      e.setAttribute(key, value)
    })
  }
}

function createChildren(e: Element, children?: VNodeList) {
  if (children) {
    children.forEach(child => createChild(e, child))
  }
}

function createChild(e: Element, child: VNode) {
  switch (typeof child) {
    case 'string':
      e.appendChild(document.createTextNode(child))
      return
    case 'number':
      e.appendChild(document.createTextNode(String(child)))
      return
  }
  if (child[0] === 'raw') {
    e.appendChild(
      document.createRange().createContextualFragment((child as Raw)[1]),
    )
    return
  }
  if (Array.isArray(child[0])) {
    ;(child as VFragment)[0].forEach(child => createChild(e, child))
    return
  }
  e.appendChild(createElement(child as VElement))
}

export let tagNameRegex = /([\w-]+)/

function applySelector(e: Element, selector: selector) {
  let idMatches = selector.match(/#([\w-]+)/)
  if (idMatches) {
    selector = selector.replace(idMatches[0], '')
    e.id = idMatches[1]
  }
  let classList: string[] = []
  for (let classMatch of selector.matchAll(/\.([\w-]+)/g)) {
    classList.push(classMatch[1])
  }
  e.className = classList.join(' ')
}

function createElementBySelector(selector: selector): Element {
  let tagNameMatch = selector.match(tagNameRegex)
  if (!tagNameMatch) {
    console.error('Failed to parse tagName from selector:', selector)
    throw new Error('Failed to parse tagName from selector')
  }
  let e = document.createElement(tagNameMatch[1])
  applySelector(e, selector)
  return e
}
