import type { ServerMessage } from '../../client'
import JSX from '../../client/jsx.js'
import { debugLog } from '../debug.js'
import { Fragment } from '../dom.js'
import { OnMessages, View } from './view'

let log = debugLog('home.tsx')
log.enabled = true

let initView = (
  <Fragment>
    <h1>Login Form</h1>
    <form>
      {['a', [['href', '#']], ['hash link']]}
      <style>
        {[
          'raw',
          `
form > label {
  color: green;
}
label {
  margin-top: 1em;
  display: block;
  text-transform: capitalize;
}
label::after {
  content: ":";
}
`,
        ]}
      </style>
      <label for="username">username</label>
      <input
        type="text"
        name="username"
        id="username"
        oninput="emit('username',this.value)"
      />
      <label for="password">password</label>
      <input
        type="password"
        name="password"
        id="password"
        oninput="emit('password',this.value)"
      />
      <br />
      <br />
      <input type="submit" value="Login" />
    </form>
    <h2>Live Preview</h2>
    <div>
      username: <span id="username-out" />
      <br />
      password: <span id="password-out" />
    </div>
    <h1>Code Snippet</h1>
    <p>html code can be escaped</p>
    <pre>
      <code>{
        /*html*/ `<button onclick="alert('running js')">click me</button>`
      }</code>
    </pre>
  </Fragment>
)

let onMessages: OnMessages = {
  username(value, ws) {
    let msg: ServerMessage = ['update', ['#username-out', [], [value]]]
    ws.send(msg)
  },
  password(value, ws) {
    let msg: ServerMessage = ['update', ['#password-out', [], [value]]]
    ws.send(msg)
  },
}

export let homeView: View = {
  initView,
  onMessages,
}
