import SArray from 's-array'
import { DataSignal } from 's-js'
import { c, h, s } from '../lib'
import { online, State } from '../state'
import { globalSRoot } from './global'

type Message = {
  id: number
  name: string
  time: number
  text: string
}

export let messages = globalSRoot.spawn(() =>
  SArray([
    {
      id: 0,
      name: 'System',
      time: Date.now(),
      text: 'Hello World',
    },
  ] as Message[]),
)
export let typing = globalSRoot.spawn(() =>
  SArray([] as Array<DataSignal<string>>),
)

export function renderChatroom(state?: State) {
  const message = state?.message() || ''
  const name = state?.name() || ''
  // let len = S.sample(() => messages().length)
  const len = messages().length
  const typingText = typing
    .map(name => name())()
    .join(', ')
  return c(
    '#room',
    h`<div id="room">
<h2>Room</h2>
<div>
  <label for="name">nickname:</label>
  <input
    type="text"
    id="name"
    name="name"
    placeholder="Your name"
    oninput="send('name', this.value)"
    value=${JSON.stringify(name)}>
</div>
<script>
function sendMessage(){
  let e = document.querySelector('input[name=message]')
  send('send', e.value)
  e.value = ''
  e.focus()
}
</script>
<div>
  <label for="msg-${len}">text message:</label>
  <input
    type="text"
    name="message"
    placeholder="A message"
    oninput="send('message', this.value)"
    onkeydown="event.keyCode == 13 ? sendMessage() : false"
    value=${JSON.stringify(message)}>
</div>
<button onclick="sendMessage()">Send</button>
<p style="color: green">
Online: ${online()
      .map(name => name())
      .join(', ')}
</p>
<p style="color: grey;opacity: ${typingText ? 1 : 0}">
Typing: ${typingText}
</p>
<p>
Number of messages: ${len}
</p>
<ol>
${messages()
  .map(message => {
    const code = s(message.text)
    return c(
      '#msg-' + message.id,
      h`<li id="msg-${message.id}">
  <p>${message.name} : ${new Date(message.time).toLocaleString()}</p>
  <span>${message.text}</span>
  ${
    code !== message.text
      ? `<code>${code}</code>`
      : '<span style="color: white">try to inject html ;)</span>'
  }
  </li>`,
    )
  })
  .reverse()}
</ol>
</div>`,
  )
}
