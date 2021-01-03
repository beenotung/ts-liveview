import morphdom from 'morphdom'
import type {
  ComponentDiff,
  ComponentView,
  Diff,
  Patch,
  Statics,
  View,
  ViewDiff,
} from '../types/view'
import { viewToHTML } from './html'

// template_id -> statics
const templates = new Map<string, Statics>()

export function onPatch(patch: Patch) {
  // update template
  if (patch.t) {
    for (const template of patch.t) {
      templates.set(template.t, template.s)
    }
  }
  // update component
  for (const component of patch.c) {
    patchComponent(component)
  }
  // update dom
  const elements = document.querySelectorAll(patch.s)
  if (elements.length === 0) {
    console.error('elements not found:', patch.s)
    return
  }
  const component = components.get(patch.s)
  if (!component) {
    console.error('patch component not found:', patch.s)
    return
  }
  const html = viewToHTML(component, templates)
  elements.forEach(e => {
    morph(e, html)
  })
}

// selector -> dynamics
const components = new Map<string, ComponentView>()

function patchComponent(patch: ComponentDiff): ComponentView {
  let component = components.get(patch.s)
  let dynamics: View[]
  if (component) {
    dynamics = component.d
    component.t = patch.t
  } else {
    dynamics = []
    component = {
      s: patch.s,
      t: patch.t,
      d: dynamics,
    }
    components.set(patch.s, component)
  }
  for (const diff of patch.d) {
    patchDiff(dynamics, /* idx */ diff[0], /* viewDiff */ diff[1])
  }
  return component
}

function patchDiff(dynamics: View[], idx: number, viewDiff: ViewDiff) {
  if (Array.isArray(viewDiff)) {
    // Diff[]
    patchDiffs(dynamics, idx, viewDiff)
    return
  }
  if (typeof viewDiff === 'object' && viewDiff !== null) {
    // ComponentDiff
    const component = patchComponent(viewDiff)
    dynamics[idx] = component
    return
  }
  // PrimitiveView
  dynamics[idx] = viewDiff
}

function patchDiffs(dynamics: View[], i: number, diffs: Diff[]): void {
  let dynamic = dynamics[i]
  if (!Array.isArray(dynamic)) {
    dynamic = dynamics[i] = []
  }
  for (const diff of diffs) {
    patchDiff(dynamic, /* idx */ diff[0], /* viewDiff */ diff[1])
  }
}

export interface MorphDomOptions {
  getNodeKey?: (node: Node) => any
  onBeforeNodeAdded?: (node: Node) => Node
  onNodeAdded?: (node: Node) => Node
  onBeforeElUpdated?: (fromEl: HTMLElement, toEl: HTMLElement) => boolean
  onElUpdated?: (el: HTMLElement) => void
  onBeforeNodeDiscarded?: (node: Node) => boolean
  onNodeDiscarded?: (node: Node) => void
  onBeforeElChildrenUpdated?: (
    fromEl: HTMLElement,
    toEl: HTMLElement,
  ) => boolean
  childrenOnly?: boolean
}

export let morphDomOptions: MorphDomOptions = {
  onBeforeElUpdated: (fromEl, toEl) => {
    if (fromEl.isEqualNode(toEl)) {
      return false
    }
    if (document.activeElement === fromEl) {
      switch (fromEl.tagName) {
        case 'INPUT':
        case 'SELECT':
          // console.debug('skip morph on:', fromEl, toEl)
          return false
      }
    }
    return true
  },
}

export function morph(e: Element, html: string) {
  morphdom(e, html, morphDomOptions)
}
