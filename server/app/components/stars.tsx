import { o } from '../jsx/jsx.js'
import Style from './style.js'

export let starsStyle = Style(/* css */ `
.stars--active {
  color: #ffd700;
}
.stars--inactive {
	filter: grayscale(100%);
}
`)

export function Stars(attrs: { score: number; max: number }) {
  let stars = []
  for (let i = 0; i < attrs.max; i++) {
    stars.push(
      <span class={i + 1 <= attrs.score ? 'stars--active' : 'stars--inactive'}>
        ⭐
      </span>,
    )
  }
  return <div>{[stars]}</div>
}
