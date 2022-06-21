import type {
  attrs,
  props,
  selector,
  title,
  VElement,
  VNode,
} from './jsx/types'

export type ClientMountMessage = [
  type: 'mount',
  url: string,
  locale: string | undefined,
  timeZone: string | undefined,
  timezoneOffset: number,
]
type Prefix<K extends string, T extends string> = `${K}${T}`
export type ClientRouteMessage = [url: Prefix<'/', string>, data?: unknown]
export type ClientMessage = ClientMountMessage | ClientRouteMessage

export type ServerMessage =
  | ['update', VElement, title?]
  | ['update-in', selector, VNode, title?]
  | ['append', selector, VNode]
  | ['remove', selector]
  | ['update-text', selector, string | number]
  | ['update-all-text', selector, string | number]
  | ['update-attrs', selector, attrs]
  | ['update-props', selector, props]
  | ['set-value', selector, string | number]
  | ['batch', ServerMessage[]]
  | ['set-cookie', string]
  | ['set-title', title]
