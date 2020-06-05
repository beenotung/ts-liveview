import S from 's-js'
import { c, h, morph, viewToHTML } from '../src'

const app = document.createElement('div')
app.id = 'app'
document.body.appendChild(app)

const user = S.data('')
Object.assign(window, { user })
S.root(() => {
  S(() => {
    const template = c(
      '#app',
      h`
<div id="app">
<label>Your name:</label>
<input id="user" value="${user()}" onchange="user(event.target.value)">
<p>
Hello: ${user()}
</p>
</div>
`,
    )
    const html = viewToHTML(template, new Map())
    morph(app, html)
  })
})
