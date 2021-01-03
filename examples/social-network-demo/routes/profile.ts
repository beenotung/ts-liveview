import S from 's-js'
import { c, h } from 'ts-liveview'
import { defaultTitle } from '../config'
import { router } from '../router'
import { users } from '../store'

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
</main>`,
    ),
  )
})
