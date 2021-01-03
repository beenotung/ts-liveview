import { c, h } from 'ts-liveview'
import { comments } from '../store'

export function feedList() {
  return c(
    `ul.feed-list`,
    h`<ul class="feed-list">
${comments().map(comment => {
  const { id, from, to } = comment
  return c(
    `#c${id}`,
    h`<li id="c${id}">
[${id}] <a href="/user/${from.id}">${from.name}</a> -> <a href="/user/${to.id}">${to.name}</a> : ${comment.content}
</li>`,
  )
})}
</ul>`,
  )
}
