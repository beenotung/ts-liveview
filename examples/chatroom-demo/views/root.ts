import { CommonRequest } from '../../../src/request'
import { c, Request, Session, View, h, Component } from '../lib'
import debug from 'debug'

let log = debug('app:view:root')

export function renderRoot(url: string, options: {
  type: 'request',
  request: CommonRequest
} | {
  type: 'session'
  session: Session
}): Component {
  log('render:', { url, type: options.type })
  let component = c('.main', h`
<div class="main">
  <h1>Chatroom Demo</h1>
  <dl>
    <dt>url</dt>
    <dd>${url}</dd>

    <dt>type</dt>
    <dd>${options.type}</dd>
  </dl>
</div>
  `)
  log('result:', component)
  return component
}
