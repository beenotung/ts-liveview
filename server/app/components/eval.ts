import type { ServerMessage } from '../../../client/types'

function s(value: string | number | object | undefined) {
  if (value === undefined) return 'undefined'
  return JSON.stringify(value)
}

export function invoke(
  fnName: string,
  args: (string | number | object | undefined)[],
) {
  // remove trailing undefined arguments to reduce message size
  while (args.length > 0 && args[args.length - 1] === undefined) {
    args.pop()
  }

  // convert arguments to strings for client side eval
  let clientArgs = args.map(s).join(',')

  // return eval ServerMessage
  return ['eval', `${fnName}(${clientArgs})`] satisfies ServerMessage
}
