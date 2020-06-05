import debug from 'debug'
import { c, Component, h, Request, Session } from '../lib'
import { State } from '../state'
import { renderChatroom } from './chatroom'
import { renderClock } from './clock'

const log = debug('app:root')

export function renderRoot(
  url: string,
  options:
    | {
        type: 'request'
        request: Request
      }
    | {
        type: 'session'
        session: Session
      },
  state?: State,
): Component {
  log('render:', { url, type: options.type })
  let dev = ''
  if (!'dev') {
    dev = `
   <dl>
    <dt>url</dt>
    <dd>${url}</dd>

    <dt>type</dt>
    <dd>${options.type}</dd>
  </dl>
`
  }
  const component = c(
    '.main',
    h`
<div class="main">
  <h1>Chatroom Demo</h1>
  ${renderClock()}
  ${dev}
  ${renderChatroom(state)}
</div>
  `,
  )
  // log('result:', component)
  return component
}
