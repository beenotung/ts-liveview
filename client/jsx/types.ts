export type VNode = Literal | Raw | Fragment | VElement
export type VElement = [selector, attrs?, VNodeList?]
export type VNodeList = VNode[]
export type Literal = string | number | null | undefined | false | true
export type Raw = ['raw', html]
export type Fragment = [VNodeList]

export type selector = string
export type attrs = Record<string, string | number | boolean | undefined | null>
export type props = Record<string, unknown>

export type html = string

export type title = string
