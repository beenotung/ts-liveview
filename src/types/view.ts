export type TemplateData =
  | string
  | number
  | boolean
  | undefined
  | null
  | ComponentTemplate

export type ComponentTemplate = {
  selector: string
  statics: TemplateStringsArray
  dynamics: TemplateData[]
}

export type Diff = Array<[number, TemplateData]>
export type TemplateDiff = {
  selector: string
  diff: Diff
}

export type Render = () => ComponentTemplate
