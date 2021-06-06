import { ServerMessage } from '../../../client'
import { Context, ContextSymbol, WsContext } from '../context'
import { ComponentFn, attrs } from './types'

export function dispatch(componentFn: ComponentFn, context: WsContext) {
  let attrs: attrs = {
    ContextSymbol: context,
  } as any
  let node = componentFn(attrs)
  console.log('node:', node)
  // TODO: think how to enable custom update logic instead of full re-render
  // TODO: update client JSX to use object attrs
  let message: ServerMessage = ['update', node as any]
  context.ws.send(message)
}
