import { c, h } from '../lib'
import SArray from 's-array'
import { globalSRoot } from './global'

type Message = {
  id: number
  time: number
  text: string
}

let messages = globalSRoot.spawn(() => SArray([] as Message[]))

export function renderChatroom() {
  return c(
    '#room',
    h`<div id="room">
<h2>Room</h2>
${messages.map(message => c(``, h``))}
</div>`,
  )
}
