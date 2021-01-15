import { c, h } from 'ts-liveview'

export function tagList() {
  return c(
    'ul.tag-list',
    h`<ul class="tag-list">
  <li><a href="/tag/demo">demo</a></li>
</ul>`,
  )
}
