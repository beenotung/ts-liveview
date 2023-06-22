import type { VNode } from '../../../client/jsx/types'
import type { Context } from '../context'
import { ErrorNode } from '../helpers'
import { Node } from '../jsx/types'

export let ErrorStyle = /* css */ `
.error {
  border: 1px solid red;
  padding: 0.75rem;
  width: fit-content;
}
`

export function renderError(error: unknown, context: Context): VNode {
  if (context.type === 'express' && !context.res.headersSent && error) {
    let code = (error as any).statusCode || (error as any).status || 500
    context.res.status(code)
  }
  return ['p.error', {}, [String(error)]]
}

export function renderErrorNode(error: ErrorNode, context: Context): Node {
  return ['p.error', {}, [error.node]]
}
