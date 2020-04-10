import { Diff, Template } from './h'

export type ClientMessage = {
  type: 'event'
  args: any[]
}
export type ServerMessage =
  | {
      type: 'paint'
      selector: string
      html: string
    }
  | {
      type: 'repaint'
      selector: string
      template: Template
    }
  | {
      type: 'patch'
      selector: string
      diff: Diff
    }
