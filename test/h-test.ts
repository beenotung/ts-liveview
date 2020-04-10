import S from 's-js'
import { h, render } from '../src/h'

const app = document.createElement('div')
app.id = 'app'
document.body.appendChild(app)

const user = S.data('')
S.root(() => {
  S(() => {
    const result = h`
<div id="app">
<label>Your name:</label>
<input id="user" value="${user()}" onchange="updateSignal(event,'user')">
<p>
Hello: ${user()}
</p>
</div>
`
    render(app, result, { user })
  })
})
