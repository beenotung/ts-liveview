import { c, h, radios } from '../lib'
import { State } from '../state'

export function renderHomePage(state: State) {
  return c(
    '#home',
    h`<div id="home">
<h2>Home Page</h2>
<input type="range" oninput="send('width',this.value)" min="100" max="500" value="${state.width()}">
<label>${state.width()}px</label>
<div>
${radios({
  id: 'bg',
  value: state.background(),
  onchange: `send('bg',event.target.value)`,
  options: [
    { value: 'white', text: 'White' },
    { value: 'black', text: 'Black' },
    { value: 'blue', text: 'Blue' },
  ],
})}
</div>
<img
width="${state.width()}"
style="background-color: ${state.background()}"
src="https://avatars0.githubusercontent.com/u/6510388"
>
</div>`,
  )
}
