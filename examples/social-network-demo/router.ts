import { allNames } from '@beenotung/tslib/constant/character-name'
import { c, h, ViewRouter } from 'ts-liveview'
import { defaultTitle } from './config'

export const router = new ViewRouter()

router.add('/', (context, cb) =>
  cb(
    c(
      'main',
      h`<main>
<a href="/">${defaultTitle}</a>
<h1>Home Page</h1>
<ul>
${allNames.map((name, i) =>
  c(
    `#u${i}`,
    h`
<li>
<svg width="80" height="50">
  <circle cx="50" cy="45" r="24" stroke="black" stroke-width="3" fill="orange"></circle>
  <circle cx="50" cy="15" r="12" stroke="black" stroke-width="3" fill="orange"></circle>
</svg>
<a href="/user/${i}">${name}</a></li>
`,
  ),
)}
</ul>
</main>`,
    ),
  ),
)

router.add('/user/:uid', (context, cb) => {
  const { uid } = context.params
  const name = allNames[uid]
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
