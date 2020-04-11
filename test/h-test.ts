import S from 's-js'
import { h, syncDom, templateToHTML } from '../src/h'

const app = document.createElement('div')
app.id = 'app'
document.body.appendChild(app)

const user = S.data('')
Object.assign(window, { user })
S.root(() => {
  S(() => {
    const template = h`
<div id="app">
<label>Your name:</label>
<input id="user" value="${user()}" onchange="user(event.target.value)">
<p>
Hello: ${user()}
</p>
</div>
`
    const html = templateToHTML(template)
    syncDom(app, html)
  })
})
