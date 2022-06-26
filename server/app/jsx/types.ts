import { Context } from '../context'

export type Node = Literal | Raw | Fragment | JSXFragment | Component | Element
export type JSXFragment = [tag: undefined, attr: null, children: NodeList]
export type Component = [ComponentFn, attrs?, NodeList?]
export type Element = [selector, attrs?, NodeList?]
export type NodeList = Node[]
export type Literal = string | number | null | undefined | false
export type Raw = ['raw', html]
export type Fragment = [NodeList]

/** @alias FC */
export type ComponentFn = (
  attrs: {
    children?: NodeList
    [key: string]: unknown
  },
  context: Context,
) => Node

export type selector = string
export type attrs = Record<string, string | number | boolean>

export type html = string
