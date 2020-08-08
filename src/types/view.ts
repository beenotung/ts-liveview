/* complete model */

export type PrimitiveView = string | number | boolean | undefined | null
export type View =
  | PrimitiveView
  | ComponentView
  // | SArray<View>
  | View[]

export type ComponentView = {
  s: string // selector
  t: string // template_id
  d: View[] // dynamics
}

/* patch */

export type Statics = ReadonlyArray<string>

export type TemplatePatch = {
  t: string // template_id
  s: Statics // statics
}

export type ComponentDiff = {
  s: string // selector
  t: string // template_id
  d: Diff[] // diff
}
export type ViewDiff = PrimitiveView | ComponentDiff | Diff[]

// [index, newValue]
export type Diff = [number, ViewDiff]

// from server to client
export type Patch = {
  t?: TemplatePatch[] // templates
  c: ComponentDiff[] // components
  s: string // selector
}
