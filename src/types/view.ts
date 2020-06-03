/* complete model */

export type PrimitiveView = string | number | boolean | undefined | null
export type View = PrimitiveView | ComponentView

export type ComponentView = {
  selector: string
  template_id: string
  dynamics: View[]
}

/* patch */

export type Statics = ReadonlyArray<string>

export type TemplatePatch = {
  template_id: string
  statics: Statics
}

export type ComponentDiff = {
  selector: string
  template_id: string
  diff: Diff[]
}
export type ViewDiff = PrimitiveView | ComponentDiff

// [index, newValue]
export type Diff = [number, ViewDiff]

// from server to client
export type Patch = {
  templates: TemplatePatch[]
  components: ComponentDiff[]
  selector: string
}
