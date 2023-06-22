import { DynamicContext, WsContext } from '../context.js'
import { o } from '../jsx/jsx.js'
import { toLocaleDateTimeString } from './datetime.js'

export let UpdateMessageStyle = /* css */ `
.update-message {
  color: green;
  font-size: smaller;
}
`

export function UpdateMessage(attrs: { id: string }) {
  return <p id={attrs.id} class="update-message"></p>
}

export function updateMessageText(
  attrs: {
    label: string
  },
  context: DynamicContext,
): string {
  let { label } = attrs
  let time = toLocaleDateTimeString(Date.now(), context, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  return `[${time}] Updated ${label}.`
}

let counter = 0

function newId() {
  counter++
  return 'update-message-' + counter
}

export function newUpdateMessage(attrs?: { id?: string }) {
  let id = attrs?.id || newId()
  let node = UpdateMessage({ id })
  let selector = '#' + id
  function sendWsUpdate(attrs: { label: string }, context: WsContext) {
    let text = updateMessageText(attrs, context)
    context.ws.send(['update-text', selector, text])
  }
  return { node, sendWsUpdate }
}
