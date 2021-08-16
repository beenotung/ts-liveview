export type Node = Literal | Raw | Fragment | JSXFragment | Component | Element
export type JSXFragment = [tag: undefined, attr: null, children: NodeList]
export type Component = [ComponentFn, attrs?, NodeList?]
export type Element = [selector, attrs?, NodeList?]
export type NodeList = Node[]
export type Literal = string | number | null | undefined | false
export type Raw = ['raw', html]
export type Fragment = [NodeList]

export type ComponentFn = (attrs?: attrs, children?: Node[]) => Node

export type selector = string
export type attrs = Record<string, string>

export type html = string
