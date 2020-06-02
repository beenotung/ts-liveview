import { TemplatePatch, Patch, PrimitiveView, Diff, Statics, ComponentDiff } from './types/view'
import hash from 'quick-hash'
import debug from 'debug'

let log = debug('liveview:h')

export type Dynamic =
  | PrimitiveView
  | Component

export type Template = {
  template_id: string
  statics: Statics
  dynamics: Dynamic[]
}

function hashTemplate(
  statics: Statics,
): string {
  return hash(statics.join(','))
}

export function h(
  statics: Statics,
  ...dynamics: Dynamic[]
): Template {
  return {
    template_id: hashTemplate(statics),
    statics,
    dynamics,
  }
}

export type Component = {
  selector: string
} & Template

export function c(selector: string, template: Template): Component {
  return {
    selector,
    ...template,
  }
}

function isStaticsSame(
  a: Statics,
  b: Statics,
) {
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

export function isTemplateSame(
  a: Template,
  b: Template,
): boolean {
  return a.template_id === b.template_id
    && isStaticsSame(a.statics, b.statics) // in case hash collision
}

export function createDummyComponent(): Component {
  return {
    selector: '',
    template_id: '',
    statics: [],
    dynamics: [],
  }
}

export function morphComponent(
  source: Component,
  target: Component,
  // template_id -> statics
  templates: Map<string, Statics>,
  // selector -> component
  components: Map<string, Component>,
): Patch {
  log('morphComponent')
  // template_id -> statics
  let newTemplates = new Map<string, Statics>()
  // selector -> component diff
  let newComponents = new Map<string, ComponentDiff>()

  function morphTemplate(
    source: Template,
    target: Template,
  ) {
    log('morph template')
    if (isTemplateSame(source, target)) {
      return
    }
    let oldStatics = templates.get(target.template_id)
    if (!oldStatics || !isStaticsSame(oldStatics, target.statics)) {
      newTemplates.set(target.template_id, target.statics)
      source.statics = target.statics
    }
    return
  }

  function morphComponent(
    source: Component,
    target: Component,
  ): ComponentDiff | false {
    log('morph component')
    morphTemplate(source, target)
    const diff: Diff[] = []
    log('target len:', target.dynamics.length)
    for (let i = 0; i < target.dynamics.length; i++) {
      log('i', i)
      let s = source.dynamics[i]
      let t = target.dynamics[i]
      if (s === t) {
        continue
      }
      let sourceIsComponent = typeof s === 'object' && s !== null
      let targetIsComponent = typeof t === 'object' && t !== null
      if (sourceIsComponent && targetIsComponent) {
        log('both component')
        let source = s as Component
        let target = t as Component
        morphTemplate(source, target)
        let componentDiff = morphComponent(source, target)
        if (componentDiff) {
          diff.push([i, componentDiff])
        }
        continue
      }
      if (targetIsComponent) {
        log('target is component')
        let source: Component = createDummyComponent()
        let target = t as Component
        components.set(target.selector, target)
        let componentDiff = morphComponent(source, target)
        if (componentDiff) {
          diff.push([i, componentDiff])
        }
        continue
      }
      diff.push([i, t as PrimitiveView])
    }
    if (diff.length === 0
      && source.selector === target.selector
      && source.template_id === target.template_id
    ) {
      return false
    }
    let componentDiff: ComponentDiff = {
      selector: target.selector,
      template_id: target.template_id,
      diff,
    }
    newComponents.set(source.selector, componentDiff)
    source.selector = target.selector
    source.template_id = target.template_id
    return componentDiff
  }

  morphComponent(source, target)

  let templatePatches: TemplatePatch[] = []
  for (let [template_id, statics] of newTemplates) {
    templatePatches.push({ template_id, statics })
  }
  return {
    templates: templatePatches,
    components: Array.from(newComponents.values()),
    selector: source.selector,
  }
}
