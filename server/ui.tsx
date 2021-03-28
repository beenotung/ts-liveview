import type { VNode } from '../client/dom'
import JSX from '../client/jsx.js'

export let initView: VNode = (
  <div id="app" className="light live">
    <h1>Login Form</h1>
    <form>
      {['a', [['href', '#']], ['hash link']]}
      <style>
        <raw>
          {`
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
`}
        </raw>
      </style>
      <label htmlFor="username">username</label>
      <input
        type="text"
        name="username"
        id="username"
        oninput="emit(['username',this.value])"
      />
      <label htmlFor="password">password</label>
      <input
        type="password"
        name="password"
        id="password"
        oninput="emit(['password',this.value])"
      />
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
    <h1>Code Snippet</h1>
    <p>html code can be escaped</p>
    <pre>
      <code>{
        /*html*/ `<button onclick="alert('running js')">click me</button>`
      }</code>
    </pre>
  </div>
) as any
