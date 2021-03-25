import type { Primus } from 'typestub-primus'

let win = window as any

let primus: Primus = win.Primus.connect('ws://localhost:8100/')

primus.on('open', () => {
  console.log('open')
  primus.id(id => {
    console.log('id:', id)
  })
})

type ServerMessage = ['update', VNode]
primus.on('data', (data: any) => {
  let [type, value] = data as ServerMessage
  switch (type) {
    case 'update':
      mountNode(value)
      break
    default:
      console.log('data:', data)
  }
})

function emit(data: any) {
  primus.write(data)
}
win.emit = emit

let app = document.querySelector('#app')!
mountElement(app, [
  'div#app.light.live',
  [],
  [
    ['h1', [], ['Login Form']],
    [
      'form',
      [],
      [
        [
          'style',
          [],
          [
            `
label {
    margin-top: 1em;
    display: block;
    text-transform: capitalize;
}
label::after {
    content: ":";
}
`,
          ],
        ],
        ['label', [], ['username']],
        [
          'input',
          [
            ['name', 'username'],
            ['type', 'text'],
            ['oninput', 'emit(["username",this.value])'],
          ],
        ],
        ['label', [], ['password']],
        [
          'input',
          [
            ['name', 'password'],
            ['type', 'password'],
            ['oninput', 'emit(["password",this.value])'],
          ],
        ],
        ['br'],
        ['br'],
        [
          'input',
          [
            ['type', 'submit'],
            ['value', 'Login'],
          ],
        ],
      ],
    ],
    ['h2', [], ['Live Preview']],
    [
      'div',
      [],
      [
        'username: ',
        ['span#username.out'],
        ['br'],
        'password: ',
        ['span#password.out'],
      ],
    ],
  ],
])

function mountNode([selector, attrs, children]: VNode) {
  let e = document.querySelector(selector)!
  mountElement(e, [selector, attrs, children])
}

function mountElement(e: Element, [selector, attrs, children]: VNode) {
  let jsonSize = JSON.stringify([selector, attrs, children]).length
  let [tagName, rest] = selector.split('#')
  setSelectorRest(e, rest)
  setAttrs(e, attrs)
  e.innerHTML = ''
  createChildren(e, children)
  let htmlSize = e.outerHTML.length
  console.log({ json: jsonSize, html: htmlSize })
}

type VNode = [selector, attrs?, children?]
type text = string
type selector = string
type attrs = [key, value][]
type key = string
type value = string
type children = (VNode | text)[]

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

function createElementBySelector(selector: selector) {
  let [tagName, rest] = selector.split('#')
  let e = document.createElement(tagName)
  setSelectorRest(e, rest)
  return e
}

function setSelectorRest(e: Element, rest: string | undefined) {
  if (rest) {
    let [id, ...classes] = rest.split('.')
    e.id = id
    e.className = classes.join(' ')
  }
}
