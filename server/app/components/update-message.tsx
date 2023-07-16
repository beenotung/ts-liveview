import { DynamicContext, WsContext } from '../context.js'
import { o } from '../jsx/jsx.js'
import { toLocaleDateTimeString } from './datetime.js'

export let UpdateMessageStyle = /* css */ `
.update-message {
  color: green;
  font-size: smaller;
}
`

// use this for multiple instance of input field update message
export function UpdateMessage(attrs: { id: string }) {
  return <p id={attrs.id} class="update-message"></p>
}

function updateMessageText(
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

export function newUpdateMessageId() {
  counter++
  return 'update-message-' + counter
}

// use this for multiple instance of input field update message
export function sendUpdateMessage(
  attrs: { label: string; selector: string },
  context: WsContext,
) {
  let text = updateMessageText(attrs, context)
  context.ws.send(['update-text', attrs.selector, text])
}

// use this to create singleton instance of input field update message
export function newUpdateMessage() {
  const id = newUpdateMessageId()
  const selector = '#' + id
  const node = UpdateMessage({ id })
  function sendWsUpdate(attrs: { label: string }, context: WsContext) {
    let text = updateMessageText(attrs, context)
    context.ws.send(['update-text', selector, text])
  }
  return { node, sendWsUpdate }
}
