import { Raw } from '../components/raw.js'
import { Style } from '../components/style.js'
import { getContext } from '../context.js'
import { Message } from '../helpers.js'
import JSX from '../jsx/jsx.js'
import { attrs } from '../jsx/types.js'
import sanitizeHTML from 'sanitize-html'
import { Script } from '../components/script.js'
import debug from 'debug'

const log = debug('demo-form.tsx')
log.enabled = true

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
let code = /* html */ `
<p>
  <i>Live</i> <b>Rich-Text</b> Editor
  <span style="color:red; background-color:lightgreen;">
    <button onclick="alert('running js')">Will it popup?</button>
  </span>
</p>
`

const style = Style(/* css */ `
form > label {
  color: green;
}
label {
  margin-top: 1rem;
  display: block;
  text-transform: capitalize;
}
.inline-label-container,
.radio-group
{
  margin-top: 1rem;
}
.inline-label-container label,
.radio-group label
{
  display: inline;
}
.radio-group label::before {
  width: 1.5em;
  display: inline-block;
  content: "";
}
label::after {
  content: ": ";
}
.btn-group input {
  border-radius: 0.25em;
  padding: 0.3em;
  margin: 0.3em;
}
[type=reset] {
  background-color: lightcoral;
  color: darkred;
}
[type=submit] {
  background-color: lightgreen;
  color: darkgreen;
}
fieldset fieldset {
  display: inline-block
}
`)

export function set(attrs: attrs) {
  const context = getContext(attrs)
  if (context.type === 'ws' && context.args) {
    const match = context.routerMatch!
    const key = match.params.key
    const value = context.args![0]
    switch (key) {
      case 'username':
        username = value
        throw new Message(['update-in', '#username-out', username])
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
  return DemoForm()
}

export function submit(attrs: attrs) {
  const context = getContext(attrs)
  function getValue() {
    if (context.type === 'ws') {
      const value = context.args![0]
      log('ws submit:', value)
      return value
    }
    if (context.type === 'express') {
      const value = context.req.body
      log('req submit:', value)
      return value
    }
  }
  const value = getValue()
  if (!value) {
    return DemoForm()
  }
  return (
    <>
      <p>
        Received:{' '}
        <pre>
          <code>{JSON.stringify(value, null, 2)}</code>
        </pre>
      </p>
      <p>(The content is not saved on server)</p>
    </>
  )
}

export function DemoForm() {
  return (
    <>
      <h2>Demo Form</h2>
      <form method="POST" action="/form/submit" onsubmit="emitForm(event)">
        {style}
        <div class="inline-label-container">
          <label for="username">username</label>
          <span id="username-out" title="Live preview of username" />
        </div>
        <input
          type="text"
          name="username"
          id="username"
          oninput="emit('/form/live/username',this.value)"
        />
        <div title="Tips to try html-injection">
          Hint: Try <code>Bob</code> and <code>{'<b>o</b>'}</code>
        </div>

        <h3>Demo more input types</h3>

        <label for="password">password</label>
        <input type="password" name="password" id="password" />

        <label for="level">level</label>
        <input type="number" name="level" id="level" min="1" />
        {Script(`level.defaultValue=1`)}

        <label for="gender">gender</label>
        <select name="gender" id="gender">
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="rainbow">Non-binary</option>
          <option value="na">Prefer not to say</option>
        </select>

        <label for="color">color</label>
        <input name="color" id="color" type="color" />

        <div class="inline-label-container">
          <label for="happy">happy?</label>
          <input name="happy" id="happy" type="checkbox" />
        </div>

        <div class="radio-group">
          <div style="margin-bottom:0.5em">Most often on:</div>
          <label for="tel">tel</label>
          <input name="contact" id="tel" type="radio" value="tel" />
          <label for="text">text</label>
          <input name="contact" id="text" type="radio" value="text" />
          <label for="video">video</label>
          <input name="contact" id="video" type="radio" value="video" />
          <label for="face">face</label>
          <input name="contact" id="face" type="radio" value="face" />
        </div>

        <div class="btn-group">
          <input type="reset" value="Reset" />
          <input type="submit" value="Submit" />
        </div>
      </form>

      <h2>Code Snippet</h2>

      <p>HTML code is escaped by default</p>
      <fieldset>
        <legend>HTML Code</legend>
        <pre>
          <code id="code-out">{code.trim()}</code>
        </pre>
      </fieldset>

      <p>But it is possible to display sanitized HTML</p>
      <fieldset>
        <legend>HTML Preview</legend>
        <div id="preview-out">{Raw(sanitize(code))}</div>
      </fieldset>

      <label for="html-input">HTML Input</label>
      <textarea
        id="html-input"
        style="width:37em;height:10em;"
        oninput="emit('/form/live/code',this.value)"
      >
        {code}
      </textarea>
    </>
  )
}

export default {
  index: DemoForm,
  submit,
  set,
}
