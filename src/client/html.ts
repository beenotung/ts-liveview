import type { ComponentView, PrimitiveView, Statics, View } from '../types/view'

export function primitiveViewToHTML(view: PrimitiveView): string {
  switch (typeof view) {
    case 'string':
      return view
    case 'number':
    case 'boolean':
      return String(view)
    case 'undefined':
      return ''
    case 'object':
      if (view === null) {
        return ''
      }
      console.error('unexpected type of primitive view:', view)
      break
    default:
      console.error('unknown type of primitive view:', view)
      break
  }
  return JSON.stringify(view)
}

export function viewToHTML(
  view: View,
  templates: Map<string, Statics>,
): string {
  if (Array.isArray(view)) {
    return view.map(view => viewToHTML(view, templates)).join('')
  }
  if (typeof view === 'object' && view !== null) {
    return componentViewToHTML(view, templates)
  }
  return primitiveViewToHTML(view)
}

function componentViewToHTML(
  component: ComponentView,
  templates: Map<string, Statics>,
): string {
  const statics = templates.get(component.t)
  if (!statics) {
    console.error('missing template:', component.t)
    return ''
  }
  const acc: string[] = []
  const S = statics.length
  const dynamics = component.d
  const D = dynamics.length
  for (let i = 0; i < S; i++) {
    acc.push(statics[i])
    if (i >= D) {
      continue
    }
    const view: View = dynamics[i]
    const html = viewToHTML(view, templates)
    acc.push(html)
  }
  return acc.join('')
}
