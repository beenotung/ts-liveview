import type { Primus } from 'typestub-primus'
import type { VNode } from './dom.js'
import { mountElement, updateNode } from './dom.js'
import JSX from './jsx.js'

let win = (typeof window === 'undefined' ? global : window) as any

let primus: Primus = win.Primus.connect('ws://localhost:8100/',{
  reconnect: {
    max: 10 * 1000
  }
})

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
      updateNode(value)
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
let root: VNode = ['div#app.loading', [], [['h1', [], ['loading']]]]
root = (
  <div id="app" className="loading">
    <h1>loading</h1>
  </div>
) as any

if (!'local') {
  mountElement(app, root)
}
