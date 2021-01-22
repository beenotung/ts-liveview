import debug from 'debug'
import S from 's-js'
import { c, h, s, ViewContext } from 'ts-liveview'
import { defaultTitle } from '../config'
import { router } from '../router'
import { preventScript } from '../sanize-html'
import { AppSession } from '../session'
import { users } from '../store'
const log = debug('profile.ts')
log.enabled = true

router.add('/user/:uid', (context, cb) => {
  const { uid } = context.params
  const user = S.sample(users).find(user => user.id === uid)
  const msgText =
    context.type === 'liveview' ? context.session.msgText() : false
  if (!user) {
    cb(
      c(
        'main',
        h`<main>
<a href="/">${defaultTitle}</a>
<p>User <code>${uid}</code> not found</p>
</main>`,
      ),
    )
    return
  }
  const name: string = user.name
  cb(
    c(
      'main',
      h`<main>
<a href="/">${defaultTitle}</a>
<h1>${name}'s Home Page</h1>
<p>ID: ${uid}</p>
<svg width="120" height="120" class="icon" viewBox="0 0 100 80">
  <circle cx="50" cy="45" r="24" stroke="black" stroke-width="3" fill="orange"></circle>
  <circle cx="50" cy="15" r="12" stroke="black" stroke-width="3" fill="orange"></circle>
</svg>
${msgBox(context)}
</main>`,
    ),
  )
})

function msgBox(context: ViewContext<AppSession>) {
  if (context.type !== 'liveview') {
    return 'enable javascript to write comments'
  }
  const value = context.session.msgText()
  const html = preventScript(value)
  const code = s(value)
  return c(
    'main .msg-box',
    h`<div class="msg-box">
<label>Send a comment:</label><br>
<textarea oninput="send('msgText', this.value)"></textarea><br>
<label>Preview:</label><br>
<div class="preview">${html}</div>
<label>Code:</label><br>
<pre class="code"><code>${code}</code></pre>
</div>`,
  )
}
