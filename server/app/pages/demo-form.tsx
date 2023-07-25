import { Raw } from '../components/raw.js'
import { Style } from '../components/style.js'
import { MessageException } from '../helpers.js'
import { o } from '../jsx/jsx.js'
import type { attrs } from '../jsx/types'
import sanitizeHTML from 'sanitize-html'
import { Script } from '../components/script.js'
import debug from 'debug'
import SourceCode from '../components/source-code.js'
import { Context, getContextFormBody } from '../context.js'
import {
  checkbox,
  color,
  int,
  object,
  optional,
  ParseResult,
  string,
  values,
} from 'cast.ts'
import { renderError } from '../components/error.js'
import { Link } from '../components/router.js'
import { apiEndpointTitle, title } from '../../config.js'
import { Routes } from '../routes.js'

const log = debug('demo-form.tsx')
log.enabled = true

function sanitize(html: string) {
  return sanitizeHTML(html, {
    allowedAttributes: { '*': ['style', 'title', 'width', 'height'] },
    allowedStyles: {
      '*': {
        'width': [/.*/],
        'height': [/.*/],
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
  <i title="with realtime updates">Live</i> <b>Rich-Text</b> Editor
  <span style="color:red; background-color:lightgreen;">
    <button onclick="alert('running js')">Will it popup?</button>
  </span>
</p>
`.trim()

const style = Style(/* css */ `
#DemoForm form > label {
  color: green;
}
#DemoForm label {
  margin-top: 1rem;
  display: block;
  text-transform: capitalize;
}
#DemoForm .inline-label-container,
#DemoForm .radio-group
{
  margin-top: 1rem;
}
#DemoForm .inline-label-container label,
#DemoForm .radio-group label
{
  display: inline;
}
#DemoForm .radio-group label::before {
  width: 1.5em;
  display: inline-block;
  content: "";
}
#DemoForm label::after {
  content: ": ";
}
#DemoForm .btn-group input {
  border-radius: 0.25em;
  padding: 0.3em;
  margin: 0.3em;
}
#DemoForm [type=reset] {
  background-color: lightcoral;
  color: darkred;
}
#DemoForm [type=submit] {
  background-color: lightgreen;
  color: darkgreen;
}
#DemoForm fieldset fieldset {
  display: inline-block
}
`)

function SetKey(_attrs: attrs, context: Context) {
  type Params = {
    key: string
  }
  if (context.type === 'ws' && context.args) {
    const match = context.routerMatch
    if (!match) {
      console.error('Assert Error: missing routerMatch in ws context')
      return
    }
    const key = (match.params as Params).key
    const value = context.args[0] as string
    switch (key) {
      case 'username':
        username = value
        throw new MessageException(['update-in', '#username-out', username])
      case 'code':
        throw new MessageException([
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

function Submit(_attrs: attrs, context: Context) {
  let body = getContextFormBody(context)
  let input: ParseResult<typeof formBody> | undefined = undefined
  let err = null
  try {
    input = formBody.parse(body, {
      name: 'form body',
    })
  } catch (error) {
    err = error
  }
  return (
    <>
      {err ? (
        renderError(err, context)
      ) : (
        <p>
          Received:{' '}
          <pre>
            <code>{JSON.stringify(input, null, 2)}</code>
          </pre>
        </p>
      )}
      <p>(The content is not saved on server)</p>
      <div>
        <Link href="/form">Retry</Link>
      </div>
    </>
  )
}

const validation = {
  username: { minLength: 3, maxLength: 64 },
  password: { minLength: 6 },
  level: { min: 1, max: 100 },
}
const formBody = object({
  username: string(validation.username),
  password: string(validation.password),
  level: int(validation.level),
  gender: optional(values(['female', 'male', 'rainbow', 'na'])),
  color: color(),
  happy: checkbox(),
  contact: optional(values(['tel', 'text', 'video', 'face'])),
})

function DemoForm() {
  return (
    <div id="DemoForm">
      <div>
        <div style="display: inline-flex; flex-direction: column">
          <h1>Demo Form</h1>
          <form method="POST" action="/form/submit" onsubmit="emitForm(event)">
            {style}

            <h2>Sanitized user input</h2>

            <div class="inline-label-container">
              <label for="username">username</label>
              <span id="username-out" title="Live preview of username" />
            </div>
            <input
              type="text"
              name="username"
              id="username"
              minlength={validation.username.minLength}
              maxlength={validation.username.maxLength}
              oninput="emit('/form/live/username',this.value)"
            />
            <div title="Tips to try html-injection">
              Hint: Try <code>Bob</code> and <code>{'<b>o</b>'}</code>
            </div>

            <h2>Demo more input types</h2>

            <label for="password">password</label>
            <input
              type="password"
              name="password"
              id="password"
              minlength={validation.password.minLength}
            />

            <label for="level">level</label>
            <input
              type="number"
              name="level"
              id="level"
              step="1"
              min={validation.level.min}
              max={validation.level.max}
            />
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
        </div>

        <div style="display: inline-block; width: 3rem"></div>

        <div style="display: inline-flex; flex-direction: column">
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
        </div>
      </div>

      <SourceCode page="demo-form.tsx" />
    </div>
  )
}

let routes: Routes = {
  '/form': {
    title: title('Demo Form'),
    description: 'Demonstrate form handling with ts-liveview',
    menuText: 'Form',
    node: <DemoForm />,
  },
  '/form/submit': {
    title: apiEndpointTitle,
    description: 'submit demo form',
    node: <Submit />,
    streaming: false,
  },
  '/form/live/:key': {
    title: apiEndpointTitle,
    description: 'set form field in realtime',
    node: <SetKey />,
    streaming: false,
  },
}

export default { routes }
