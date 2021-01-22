import debug from 'debug'
import S from 's-js'
import { c, h, s, sanitizeScriptInHTML, ViewContext } from 'ts-liveview'
import { defaultTitle } from '../config'
import { router } from '../router'
import { AppSession } from '../session'
import { users } from '../store'

const log = debug('profile.ts')
log.enabled = true

router.add('/user/:uid', (context, cb) => {
  const { uid } = context.params
  const user = S.sample(users).find(user => user.id === uid)
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
${msgBox(name, context)}
</main>`,
    ),
  )
})

function msgBox(name: string, context: ViewContext<AppSession>) {
  if (context.type !== 'liveview') {
    return 'enable javascript to write comments'
  }
  const value = context.session.msgText()
  const html = sanitizeScriptInHTML(value)
  const code = s(value)
  return c(
    'main .msg-box',
    h`<div class="msg-box">
<style>
main .msg-box textarea {
  width: 100%;
  height: 7em;
}
main .msg-box .preview {
  outline: 1px solid aqua;
}
main .msg-box .code {
  outline: 1px solid chocolate;
}
</style>
<label>Send a comment:</label><br>
<textarea onautocomplete oninput="send('msgText', this.value)" id="msgText"></textarea><br>
<button onclick='send("sendComment", ${JSON.stringify(
      name,
    )}); msgText.value=""'>Send</button><br>
<label>Preview:</label><br>
<div class="preview">${html}</div>
<label>Code:</label><br>
<pre class="code"><code>${code}</code></pre>
</div>`,
  )
}
