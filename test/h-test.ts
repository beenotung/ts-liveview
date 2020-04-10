import { h, render } from '../src/h'
import S from 's-js'

let app = document.createElement('div')
app.id = 'app'
document.body.appendChild(app)

let user = S.data('')
S.root(() => {
  S(() => {
    let result = h`
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
