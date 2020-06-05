import { Patch } from './view'

// export type ClientMessage = {
//   type: 'event'
//   args: any[]
// }
export type ClientMessage = any[]

export type PatchMessage = {
  type: 'patch'
} & Patch

export type ServerMessage = PatchMessage
