import { Style } from '../components/style.js'
import { getContext } from '../context.js'
import { Message } from '../helpers.js'
import JSX from '../jsx/jsx.js'
import { attrs } from '../jsx/types.js'

let username = ''
let password = ''

export function DemoForm(attrs: attrs) {
  const context = getContext(attrs)
  if (context.type === 'ws') {
    const match = context.routerMatch!
    const key = match.params.key
    const value = context.args![0]
    switch (key) {
      case 'username':
        username = value
        throw new Message(['update-in', '#username-out', username])
      case 'password':
        password = value
        throw new Message(['update-in', '#password-out', password])
      default:
        console.log('unknown key in DemoForm, key:', key)
        break
    }
  }

  return (
    <>
      <h2>Login Form</h2>
      <form>
        {['a', { href: '#' }, ['hash link']]}
        {Style(`
form > label {
  color: green;
}
label {
  margin-top: 1rem;
  display: block;
  text-tranform: capitalize;
}
label::after {
  content: ":";
}
`)}
        <label for="username">username</label>
        <input
          type="text"
          name="username"
          id="username"
          oninput="emit('/form/username',this.value)"
        />
        <div title="Tips to try html-injection">
          Try <code>Bob</code> and <code>{'<b>o</b>'}</code>
        </div>
        <label for="password">password</label>
        <input
          type="password"
          name="password"
          id="password"
          oninput="emit('/form/password',this.value)"
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
      <h2>Code Snippet</h2>
      <p>html code is escaped by default</p>
      <pre>
        <code>{
          /*html*/ `<button onclick="alert('running js')">click me</button>`
        }</code>
      </pre>
    </>
  )
}
