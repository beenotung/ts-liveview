import type { PushStateMessage } from '../types/message'

export function pushState(message: PushStateMessage) {
  if (message.title) {
    const state = message.state || {}
    state.title = message.title
    history.pushState(state, message.title, message.url)
    document.title = message.title
  } else {
    history.pushState(message.state, '', message.url)
  }
}
