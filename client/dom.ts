export type VNode = [selector, attrs?, children?]
export type children = Array<text | Raw | VNodeList | VNode>
export type Raw = ['raw', html]
export type VNodeList = ['list', children]
type html = string
type text = string
type selector = string
type attrs = [key, value][]
type key = string
type value = string

export function updateNode([selector, attrs, children]: VNode) {
  let e = document.querySelector(selector)
  if (!e) {
    console.log('Failed to lookup element to mountNode, selector:', selector)
    throw new Error('Failed to lookup element to mountNode')
  }
  mountElement(e, [selector, attrs, children])
}

export function mountElement(e: Element, [selector, attrs, children]: VNode) {
  let jsonSize = JSON.stringify([selector, attrs, children]).length
  applySelector(e, selector)
  setAttrs(e, attrs)
  e.innerHTML = ''
  createChildren(e, children)
  let htmlSize = e.outerHTML.length
  console.log({ json: jsonSize, html: htmlSize })
}

function createNode([selector, attrs, children]: VNode): Element {
  let e = createElementBySelector(selector)
  setAttrs(e, attrs)
  createChildren(e, children)
  return e
}

function setAttrs(e: Element, attrs?: attrs) {
  attrs?.forEach(([key, value]) => {
    e.setAttribute(key, value)
  })
}

function createChildren(e: Element, children?: children) {
  if (!children) {
    return
  }
  children.forEach(child => createChild(e, child))
}

function createChild(e: Element, child: children[number]) {
  if (typeof child === 'string') {
    e.appendChild(document.createTextNode(child))
    return
  }
  if (child[0] === 'raw') {
    e.appendChild(
      document.createRange().createContextualFragment((child as Raw)[1]),
    )
    return
  }
  if (child[1] === 'list') {
    ;(child as VNodeList)[1].forEach(child => createChild(e, child))
    return
  }
  e.appendChild(createNode(child as VNode))
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
