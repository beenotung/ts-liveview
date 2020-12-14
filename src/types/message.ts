import type { MessageType } from './enum'
import type { Patch } from './view'

// export type ClientMessage = {
//   type: 'event'
//   args: any[]
// }
export type ClientMessage = any[]

export type PatchMessage = {
  type: MessageType.patch
} & Patch

export type PushStateMessage = {
  type: MessageType.pushState
  state?: any
  title?: string
  url?: string
}

export type ServerMessage = PatchMessage | PushStateMessage
