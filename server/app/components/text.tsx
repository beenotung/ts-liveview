import { o } from '../jsx/jsx.js'
import type { Fragment, Node } from '../jsx/types'

/** @description consider set "white-space" css property instead */
function text(text: string): Fragment {
  let nodes: Node[] = []
  text.split('\n').forEach(line => nodes.push(line, <br />))
  nodes.pop()
  return [nodes]
}

export default text
