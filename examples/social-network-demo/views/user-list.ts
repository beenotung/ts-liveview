import { c, h } from 'ts-liveview'
import { users } from '../store'

export function userList() {
  return c(
    `ul.user-list`,
    h`<ul class="user-list">
${users().map(user => {
  const id = user.id
  const name = user.name
  return c(
    `#u${id}`,
    h`<li id="u${id}">
<svg width="80" height="50">
  <circle cx="50" cy="45" r="24" stroke="black" stroke-width="3" fill="orange"></circle>
  <circle cx="50" cy="15" r="12" stroke="black" stroke-width="3" fill="orange"></circle>
</svg>
[${id}] <a href="/user/${id}">${name}</a></li>
</li>`,
  )
})}
</ul>`,
  )
}
