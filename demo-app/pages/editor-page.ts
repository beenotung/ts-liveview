import { c, h, radios } from '../lib'
import { State } from '../state'

export function renderEditorPage(state: State) {
  return c(
    '#editor',
    h`<div id="editor">
<h2>Editor Demo</h2>
<p>
This demo illustrate how low-latency can it be even when
the state and logic are maintained on the server.
</p>
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
<hr>
<p>
Reference: <a href="https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript">Phoenix LiveView: Interactive, Real-Time Apps. No Need to Write JavaScript. - DockYard</a>
</p>
<div>Screencast from the blog:</div>
<img src="https://i.imgur.com/DYIv3ut.gif" alt="demo">
</div>`,
  )
}
