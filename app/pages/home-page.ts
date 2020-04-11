import { c, h } from '../lib'

export function renderHomePage() {
  return c(
    '#home',
    h`<div id="home">
<h2>Home Page</h2>
</div>`,
  )
}
