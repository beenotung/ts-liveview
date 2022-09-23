import type { VNode } from '../../../client/jsx/types'
import type { Context } from '../context'

export function renderError(error: unknown, context: Context): VNode {
  if (context.type === 'express' && !context.res.headersSent && error) {
    let code = (error as any).statusCode || (error as any).status || 500
    context.res.status(code)
  }
  return ['p.error', {}, [String(error)]]
}
