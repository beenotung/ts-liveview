import type { ServerMessage } from '../../../client/types'
import type { VElement, title } from '../../../client/jsx/types'
import type { WsContext } from '../context'
import type { Element, Component } from './types'
import { nodeToVElementOptimized } from './vnode.js'
import { Locale } from '../components/locale.js'
import { client_config } from '../../../client/client-config.js'

export function dispatchUpdate(
  context: WsContext,
  node: Component | Element,
  title?: title,
) {
  console.log('dispatch update, node:')
  console.dir(node, { depth: 1 })
  const vElement: VElement = nodeToVElementOptimized(node, context)
  let message: ServerMessage = title
    ? ['update', vElement, title]
    : ['update', vElement]
  if (context.event === 'remount') {
    let title = Locale(
      { en: 'page updated', zh_hk: '頁面已更新', zh_cn: '页面已更新' },
      context,
    )
    let icon = 'info'
    let position = 'top-end'
    let duration = client_config.toast_duration_short
    message = [
      'batch',
      [
        ['add-class', 'body', 'no-animation'],
        message,
        [
          'eval',
          `showToast("${title}", "${icon}", "${position}", ${duration})`,
        ],
      ],
    ]
  }
  context.ws.send(message)
}
