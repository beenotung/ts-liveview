import type { Server } from 'ws'
import type JSX from '../../client/jsx'
import type { ManagedWebSocket } from '../wss'

export type View<
  Props extends Record<string, any> = any,
  Events extends Record<string, any> = any
> = {
  initView?: JSX.Element
  render?: (props: Props) => JSX.Element
  onMessages?: Record<
    keyof Events,
    (event: Events[keyof Events], ws: ManagedWebSocket, wss: Server) => void
  >
}
