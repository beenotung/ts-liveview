import type { Server } from 'ws'
import type JSX from '../../client/jsx'
import type { ManagedWebsocket } from '../ws/wss'

type Dict = Record<string, any>

export type View<Props extends Dict = any, Events extends Dict = any> = {
  initView?: JSX.Element
  render?: Render<Props>
  onMessages?: OnMessages<Events>
}

export type Render<Props extends Dict = any> = (props: Props) => JSX.Element

export type OnMessages<Events extends Dict = any> = Record<
  keyof Events,
  EventListener<Events[keyof Events]>
>

export type EventListener<Event = any> = (
  event: Event,
  ws: ManagedWebsocket,
  wss: Server,
) => void
