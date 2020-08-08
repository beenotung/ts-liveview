import S from 's-js'
import { c, h } from '../src/h'
import { morph } from '../src/h-client'
import { toHTML } from '../src/helpers/render'

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
<input id="user" value="${user()}" onchange="user(this.value)">
<p>
Hello: ${user()}
</p>
</div>
`,
    )
    const html = toHTML(template)
    morph(app, html)
  })
})
