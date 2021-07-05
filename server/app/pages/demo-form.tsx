import { Raw } from '../components/raw.js'
import { Style } from '../components/style.js'
import { getContext } from '../context.js'
import { Message } from '../helpers.js'
import JSX from '../jsx/jsx.js'
import { attrs } from '../jsx/types.js'
import sanitizeHTML from 'sanitize-html'

function sanitize(html: string) {
  return sanitizeHTML(html, {
    allowedAttributes: { '*': ['style'] },
    allowedStyles: {
      '*': {
        'color': [/.*/],
        'background-color': [/.*/],
        'font-size': [/.*/],
        'text-align': [/.*/],
      },
    },
  })
}

let username = ''
let password = ''
let code = /* html */ `
<p>
  <i>Live</i> <b>Rich-Text</b> Editor
  <span style="color:red; background-color:lightgreen;">
    <button onclick="alert('running js')">Will it popup?</button>
  </span>
</p>
`

export function DemoForm(attrs: attrs) {
  const context = getContext(attrs)
  if (context.type === 'ws' && context.args) {
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
      case 'code':
        throw new Message([
          'batch',
          [
            ['update-in', '#code-out', value],
            ['update-in', '#preview-out', Raw(sanitize(value))],
          ],
        ])
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
      <p>HTML code is escaped by default</p>
      <pre>
        <code id="code-out">{code}</code>
      </pre>
      <p>But it is possible to display sanitized HTML</p>
      <div id="preview-out">{Raw(sanitize(code))}</div>
      <textarea
        style="width:37em;height:10em;"
        oninput="emit('/form/code',this.value)"
      >
        {code}
      </textarea>
    </>
  )
}

export default DemoForm
