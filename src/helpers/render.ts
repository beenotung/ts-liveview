import { viewToHTML } from '../client/html'
import { Component, dynamicToHTML } from '../h'
import { PrimitiveView } from '../types/view'
import { sampleInSRoot } from './s-js'

export function toHTML(view: PrimitiveView | Component) {
  return typeof view === 'object' && view !== null
    ? // is component
      dynamicToHTML(view, new Map())
    : // is primitive view
      viewToHTML(view, new Map())
}

export function sampleView(render: () => PrimitiveView | Component) {
  return toHTML(sampleInSRoot(render))
}
