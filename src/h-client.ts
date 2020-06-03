import morphdom from 'morphdom'
import { Component } from './h'
import { ComponentView, Statics, View } from './types/view'

export function viewToHTML(
  view: View,
  templates: Map<string, Statics>,
): string {
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
      return componentToHTML(view, templates)
    default:
      console.error('unknown type of view:', view)
      return ''
  }
}

function componentToHTML(
  component: ComponentView,
  templates: Map<string, Statics>,
): string {
  let statics = templates.get(component.template_id)
  if (!statics) {
    statics = (component as Component).statics
    if (!statics) {
      console.error('missing template:', component.template_id)
      return ''
    }
    templates.set(component.template_id, statics)
  }
  const acc: string[] = []
  const S = statics.length
  const dynamics = component.dynamics
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

export function morph(e: Element, html: string) {
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
