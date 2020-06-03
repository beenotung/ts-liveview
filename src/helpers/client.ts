import { Primus } from 'typestub-primus'
import { morph, viewToHTML } from '../h-client'
import { ClientMessage, ServerMessage } from '../types/message'
import {
  ComponentDiff,
  ComponentView,
  Patch,
  Statics,
  View,
} from '../types/view'

// TODO remove debug logs

function startPrimus(baseUrl: string): Primus {
  return new (window as any).Primus(baseUrl)
}

function getQueryUrl() {
  const hash = 'hash=' + encodeURIComponent(location.hash.replace('#', ''))
  const search = location.search
  if (search) {
    return search + '&' + hash
  } else {
    return '?' + hash
  }
}

function startWs() {
  let url = location.origin.replace('http', 'ws')
  url += getQueryUrl()
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

function patchComponent(patch: ComponentDiff) {
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
    const view = diff[1]
    if (typeof view === 'object' && view !== null) {
      dynamics[idx] = patchComponent(view)
    } else {
      dynamics[idx] = view
    }
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
    console.debug('data:', data)
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
