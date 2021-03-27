import type { Primus } from 'typestub-primus'
import type { VNode } from './dom'
import { mountElement, mountNode } from './dom'
import JSX from './jsx'

let win = (typeof window === 'undefined' ? global : window) as any

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
let root: VNode = ['div#app.loading', [], [['h1', [], ['loading']]]]
root = (
  <div id="app" className="light live">
    <h1>Login Form</h1>
    <form>
      <style>
        {`
label {
  margin-top: 1em;
  display: block;
  text-transform: capitalize;
}
label::after {
  content: ":";
}
`}
      </style>
      <label htmlFor="username">username</label>
      <input type="text" name="username" id="username" oninput="emit(['username',this.value])" />
      <label htmlFor="password">password</label>
      <input type="password" name="password" id="password" oninput="emit(['password',this.value])" />
      <br />
      <br />
      <input type="submit" value="Login" />
    </form>
    <h2>Live Preview</h2>
    <div>
      username: <span id="username-out"></span>
      <br />
      password: <span id="password-out"></span>
    </div>
  </div>
) as any

mountElement(app, root)