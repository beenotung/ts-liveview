import {
  Fragment,
  Raw,
  VNode,
  attrs,
  VElement,
  VNodeList,
  props,
} from './types'

function findAndApplyRedirect(root: ParentNode) {
  root.querySelectorAll('a[data-live=redirect]').forEach(e => {
    let a = e as HTMLAnchorElement
    let title = a.title || document.title
    history.replaceState(null, title, a.href)
    a.remove()
  })
}

window.addEventListener('DOMContentLoaded', () => {
  findAndApplyRedirect(document)
})

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

export function updateNode(selector: string, node: VNode) {
  let e = document.querySelector(selector)
  if (!e) {
    console.error(
      'Failed to query selector when updateNode, selector:',
      selector,
    )
    throw new Error('Failed to query selector when updateNode')
  }
  e.innerHTML = ''
  createChild(e, node)
}

export function appendNode(selector: string, node: VNode) {
  let e = document.querySelector(selector)
  if (!e) {
    console.error(
      'Failed to query selector when appendNode, selector:',
      selector,
    )
    throw new Error('Failed to query selector when appendNode')
  }
  createChild(e, node)
}

export function removeNode(selector: string) {
  let e = document.querySelector(selector)
  if (!e) {
    console.error(
      'Failed to query selector when removeNode, selector:',
      selector,
    )
    throw new Error('Failed to query selector when removeNode')
  }
  e.remove()
}

export function updateText(selector: string, text: string) {
  let e = document.querySelector(selector)
  if (!e) {
    console.error(
      'Failed to query selector when updateText, selector:',
      selector,
    )
    throw new Error('Failed to query selector when updateText')
  }
  e.textContent = text
}

export function updateAllText(selector: string, text: string) {
  document.querySelectorAll(selector).forEach(e => {
    e.textContent = text
  })
}

export function updateAttrs(selector: string, attrs: attrs) {
  let e = document.querySelector(selector)
  if (!e) {
    console.error(
      'Failed to query selector when updateAttrs, selector:',
      selector,
    )
    throw new Error('Failed to query selector when updateAttrs')
  }
  applyAttrs(e, attrs)
}

export function updateProps(selector: string, props: props) {
  let e = document.querySelector(selector)
  if (!e) {
    console.error(
      'Failed to query selector when updateProps, selector:',
      selector,
    )
    throw new Error('Failed to query selector when updateProps')
  }
  applyProps(e, props)
}

export function setValue(selector: string, value: string | number) {
  let e = document.querySelector(selector) as HTMLInputElement
  if (!e) {
    console.error('Failed to query selector when setValue, selector:', selector)
    throw new Error('Failed to query selector when setValue')
  }
  e.value = value as string
}

function mountElement(e: Element, element: VElement) {
  let [selector, attrs, children] = element
  applySelector(e, selector)
  if (attrs) applyAttrs(e, attrs)
  let jsonSize = JSON.stringify(element).length
  let htmlSize: number
  if (children) {
    e.innerHTML = ''
    createChildren(e, children)
    htmlSize = e.outerHTML.length
  } else {
    htmlSize = e.outerHTML.length - e.innerHTML.length
  }
  console.debug({ jsonSize, htmlSize })
  if (jsonSize < htmlSize) {
    console.debug('saved:', ((jsonSize / htmlSize) * 100).toFixed(2) + '%')
  } else {
    console.debug(
      'json overhead:',
      (((jsonSize - htmlSize) / htmlSize) * 100).toFixed(2) + '%',
    )
  }
}

function createElement(element: VElement): Element | null {
  let [selector, attrs, children] = element
  if (attrs) {
    let cmd = attrs['data-live']
    switch (cmd) {
      case undefined:
        break
      case 'redirect': {
        let title = (attrs.title as string) || document.title
        history.replaceState(null, title, attrs.href as string)
        return null
      }
      default:
        console.debug('unhandled liveview command:', cmd)
    }
  }
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
    e.setAttribute(entry[0], entry[1] as string)
  })
  let input = e as HTMLInputElement
  if (input.tagName === 'INPUT' && input.type === 'radio') {
    if ('checked' in attrs) {
      input.checked = !!attrs.checked
    }
  }
}

function applyProps(e: Element, props: props) {
  Object.entries(props).forEach(entry => {
    ;(e as any)[entry[0]] = entry[1]
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
      // case true:
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
    const fragment = document.createRange().createContextualFragment(node[1])
    e.appendChild(fragment)
    findAndApplyRedirect(fragment)
    return
  }
  if (Array.isArray(node[0])) {
    node = node as Fragment
    node[0].forEach(child => createChild(e, child))
    return
  }

  node = node as VElement
  let element = createElement(node)
  if (element) {
    e.appendChild(element)
  }
}
