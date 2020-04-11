import { ComponentTemplate, Diff, TemplateData } from './types/view'

import morphdom from 'morphdom'

function templateDataToHTML(data: TemplateData): string {
  switch (typeof data) {
    case 'undefined':
      return ''
    case 'object':
      if (data === null) {
        return ''
      }
      return (data as object).toString()
    case 'boolean':
      return data ? 'true' : 'false'
    case 'number':
      return data.toString()
    case 'string':
      return data
    case 'function':
      return templateDataToHTML((data as () => TemplateData)())
    case 'symbol':
      return (data as symbol).toString()
    case 'bigint':
      return (data as bigint).toString()
    default: {
      console.warn('unexpected type:', typeof data)
      return (data as any).toString()
    }
  }
}

export type Template = {
  statics: TemplateStringsArray
  dynamics: TemplateData[]
}

function isComponentTemplate(c: ComponentTemplate): true
function isComponentTemplate(c: TemplateData): false
function isComponentTemplate(o: TemplateData): boolean {
  const c: ComponentTemplate = o as any
  return (
    !!c && typeof c === 'object' && !!c.selector && !!c.statics && !!c.dynamics
  )
}

export function templateToHTML(
  template: Template,
  onComponentTemplate?: (c: ComponentTemplate) => void,
): string {
  const dynamics = template.dynamics
  const statics = template.statics
  const D = dynamics.length
  const S = statics.length
  let acc = ''
  for (let i = 0; i < S; i++) {
    acc += statics[i]
    if (i < D) {
      const value = dynamics[i]
      if (isComponentTemplate(value)) {
        const view = value as ComponentTemplate
        if (onComponentTemplate) {
          onComponentTemplate(view)
        }
        acc += templateToHTML(view, onComponentTemplate)
      } else {
        acc += templateDataToHTML(value)
      }
    }
  }
  return acc
}

export function h(
  statics: TemplateStringsArray,
  ...dynamics: TemplateData[]
): Template {
  return {
    statics,
    dynamics,
  }
}

export function c(selector: string, template: Template): ComponentTemplate {
  return Object.assign({ selector }, template)
}

export function isTemplateSame(
  a: TemplateStringsArray,
  b: TemplateStringsArray,
): boolean {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

export function calcDiff(source: TemplateData[], target: TemplateData[]): Diff {
  const diff: Diff = []
  for (let i = 0; i < target.length; i++) {
    const s = source[i]
    const t = target[i]
    if (s !== t) {
      diff.push([i, t])
    }
  }
  return diff
}

export function syncDom(e: Element, html: string) {
  morphdom(e, html, {
    onBeforeElUpdated: (fromEl, toEl) => {
      if (fromEl.isEqualNode(toEl)) {
        return false
      }
      if (document.activeElement === fromEl) {
        switch (fromEl.tagName) {
          case 'INPUT':
          case 'SELECT':
            return false
        }
      }
      return true
    },
  })
}
