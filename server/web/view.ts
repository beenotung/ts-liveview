import { VNode } from '../../client/dom'
import { Context } from './context'

export type View = {
  render: (context: Context) => VNode
}
