import { ComponentTemplate, TemplateDiff } from './view'

export type ClientMessage = {
  type: 'event'
  args: any[]
}

export type RenderMessage = {
  type: 'render'
} & ComponentTemplate
export type PatchMessage = {
  type: 'patch'
} & TemplateDiff

export type ServerMessage = RenderMessage | PatchMessage
