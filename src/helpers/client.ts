import { Primus } from 'typestub-primus'
import { morph, viewToHTML } from '../h-client'
import { ClientMessage, ServerMessage } from '../types/message'
import {
  ComponentDiff,
  ComponentView,
  Diff,
  Patch,
  Statics,
  View,
  ViewDiff,
} from '../types/view'

// TODO remove debug logs

function startPrimus(url: string): Primus {
  return new (window as any).Primus(url)
}

function addParam(query: string, name: string, value: string) {
  if (query === '') {
    query = '?'
  }
  if (query !== '?') {
    query += '&'
  }
  query += name + '=' + encodeURIComponent(value)
  return query
}

function getQueryUrl() {
  let query = location.search
  const pathname = location.pathname.replace('/', '')
  if (pathname) {
    query = addParam(query, 'pathname', pathname)
  }
  const hash = location.hash.replace('#', '')
  if (hash) {
    query = addParam(query, 'hash', hash)
  }
  return query
}

function startWs() {
  let url = location.origin
  const query = getQueryUrl()
  if (query && query !== '?') {
    url += '/' + query
  }
  const primus = startPrimus(url)
  primus.on('close', () => {
    console.debug('disconnected with server')
  })
  primus.on('open', () => {
    console.debug('connected with server')
  })
  return primus
}

let primus: Primus

function send(...args: any[]) {
  // primus.write({ type: 'event', args })
  const msg: ClientMessage = args
  primus.write(msg)
}

// template_id -> statics
const templates = new Map<string, Statics>()

// selector -> dynamics
const components = new Map<string, ComponentView>()

function onPatch(patch: Patch) {
  // console.debug('patch', patch)
  // update template
  for (const template of patch.templates) {
    templates.set(template.template_id, template.statics)
  }
  // update component
  for (const component of patch.components) {
    patchComponent(component)
  }
  // update dom
  const elements = document.querySelectorAll(patch.selector)
  if (elements.length === 0) {
    console.error('elements not found:', patch.selector)
    return
  }
  const component = components.get(patch.selector)
  if (!component) {
    console.error('patch component not found:', patch.selector)
    return
  }
  const html = viewToHTML(component, templates)
  elements.forEach(e => {
    morph(e, html)
  })
}

function patchDiff(dynamics: View[], idx: number, viewDiff: ViewDiff): void {
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
    const idx = diff[0]
    const viewDiff = diff[1]
    patchDiff(dynamic, idx, viewDiff)
  }
}

function patchComponent(patch: ComponentDiff): ComponentView {
  let component = components.get(patch.selector)
  let dynamics: View[]
  if (component) {
    dynamics = component.dynamics
    component.template_id = patch.template_id
  } else {
    dynamics = []
    component = {
      selector: patch.selector,
      template_id: patch.template_id,
      dynamics,
    }
    components.set(patch.selector, component)
  }
  for (const diff of patch.diff) {
    const idx = diff[0]
    const viewDiff = diff[1]
    patchDiff(dynamics, idx, viewDiff)
  }
  return component
}

function main() {
  Object.assign(window, { send })
  if (primus) {
    console.debug('skip primus init when hot reload')
    return // already started
  }
  primus = startWs()
  primus.on('data', (data: any) => {
    // console.debug('data:', data)
    if (typeof data === 'object' && data !== null) {
      const message = data as ServerMessage
      if (message.type === 'patch') {
        return onPatch(message)
      }
    }
    console.error('unknown data from server:', data)
  })
}

if (typeof window !== 'undefined') {
  main()
}
