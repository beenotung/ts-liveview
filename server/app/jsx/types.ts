import type { Context } from '../context'

export type Node = Literal | Raw | Fragment | JSXFragment | Component | Element
export type JSXFragment = [tag: undefined, attr: null, children: NodeList]
export type Component<Attrs = CFAttrs> = [ComponentFn<Attrs>, attrs?, NodeList?]
export type Element = [selector, attrs?, NodeList?]
export type NodeList = Node[]
export type Literal = string | number | null | undefined | false | true
export type Raw = ['raw', html]
export type Fragment = [NodeList]

type CFAttrs = { children?: NodeList }

/** similar to React.FC */
export type ComponentFn<Attrs = CFAttrs> = (
  attrs: Attrs,
  context: Context,
) => Node

export type selector = string
export type attrs = Record<string, string | number | boolean | undefined | null>

export type html = string
