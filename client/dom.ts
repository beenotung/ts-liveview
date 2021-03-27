export type VNode = [selector, attrs?, children?]
type text = string
type selector = string
type attrs = [key, value][]
type key = string
type value = string
export type children = (VNode | text)[]

export function mountNode([selector, attrs, children]: VNode) {
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

function createNode([selector, attrs, children]: VNode) {
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
  children?.forEach(child =>
    e.appendChild(
      typeof child === 'string'
        ? document.createTextNode(child)
        : createNode(child),
    ),
  )
}

let tagNameRegex = /([\w-]+)/

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

function createElementBySelector(selector: selector) {
  let tagNameMatch = selector.match(tagNameRegex)
  if (!tagNameMatch) {
    console.error('Failed to parse tagName from selector:', selector)
    throw new Error('Failed to parse tagName from selector')
  }
  let e = document.createElement(tagNameMatch[1])
  applySelector(e, selector)
  return e
}
