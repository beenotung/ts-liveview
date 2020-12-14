import debug from 'debug'
import hash from 'quick-hash'
import { primitiveViewToHTML } from './client/html'
import {
  ComponentDiff,
  Diff,
  Patch,
  PrimitiveView,
  Statics,
  TemplatePatch,
} from './types/view'

const log = debug('liveview:h')

export type Dynamic =
  | PrimitiveView
  | Component
  // |SArray<Dynamic>
  | Dynamic[]

export type Template = {
  template_id: string
  statics: Statics
  dynamics: Dynamic[]
}

function hashTemplate(statics: Statics): string {
  return hash(statics.join(','))
}

export function h(statics: Statics, ...dynamics: Dynamic[]): Template {
  return {
    template_id: hashTemplate(statics),
    statics,
    dynamics,
  }
}

export type Component = {
  selector: string
  title?: string
} & Template

export function c(
  selector: string,
  title: string,
  template: Template,
): Component
export function c(selector: string, template: Template): Component
export function c(): Component {
  if (arguments.length === 2) {
    return {
      selector: arguments[0],
      ...(arguments[1] as Template),
    }
  } else if (arguments.length === 3) {
    return {
      selector: arguments[0],
      title: arguments[1],
      ...(arguments[2] as Template),
    }
  } else {
    throw new Error(
      'Assert Error: expect 2 or 3 arguments, got: ' + arguments.length,
    )
  }
}

export function dynamicToHTML(
  view: Dynamic,
  templates: Map<string, Statics>,
): string {
  if (Array.isArray(view)) {
    return view.map(view => dynamicToHTML(view, templates)).join('')
  }
  if (typeof view === 'object' && view !== null) {
    return componentToHTML(view, templates)
  }
  return primitiveViewToHTML(view)
}

function componentToHTML(
  component: Component,
  templates: Map<string, Statics>,
): string {
  let statics = templates.get(component.template_id)
  if (!statics) {
    statics = component.statics
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
    const view = dynamics[i]
    const html = dynamicToHTML(view, templates)
    acc.push(html)
  }
  return acc.join('')
}

function isStaticsSame(a: Statics, b: Statics) {
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

export function isTemplateSame(a: Template, b: Template): boolean {
  return a.template_id === b.template_id && isStaticsSame(a.statics, b.statics) // in case hash collision
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
  const newTemplates = new Map<string, Statics>()
  // selector -> component diff
  const newComponents = new Map<string, ComponentDiff>()

  function morphTemplate(source: Template, target: Template) {
    log('morph template')
    if (isTemplateSame(source, target)) {
      return
    }
    const oldStatics = templates.get(target.template_id)
    if (!oldStatics || !isStaticsSame(oldStatics, target.statics)) {
      templates.set(target.template_id, target.statics)
      newTemplates.set(target.template_id, target.statics)
      source.statics = target.statics
    }
    return
  }

  function scanTemplate(target: Template) {
    const oldStatics = templates.get(target.template_id)
    if (oldStatics && isStaticsSame(oldStatics, target.statics)) {
      return
    }
    templates.set(target.template_id, target.statics)
    newTemplates.set(target.template_id, target.statics)
  }

  function dynamicToDiff(dynamic: Dynamic, i: number): Diff {
    if (Array.isArray(dynamic)) {
      // Dynamic[]
      return [i, dynamicsToDiff(dynamic)]
    } else if (typeof dynamic === 'object' && dynamic !== null) {
      // Component
      scanTemplate(dynamic)
      return [
        i,
        {
          s: dynamic.selector,
          t: dynamic.template_id,
          d: dynamic.dynamics.map((dynamic, i) => dynamicToDiff(dynamic, i)),
        },
      ]
    } else {
      // PrimitiveView
      return [i, dynamic]
    }
  }

  function dynamicsToDiff(dynamics: Dynamic[]): Diff[] {
    return dynamics.map((dynamic, i) => {
      return dynamicToDiff(dynamic, i)
    })
  }

  function morphDynamic(
    source: Dynamic,
    target: Dynamic,
    i: number,
  ): Diff | false {
    if (source === target) {
      return false
    }
    if (source !== undefined) {
      log({ i, source, target })
    }

    // check for array
    const sourceIsArray = Array.isArray(source)
    const targetIsArray = Array.isArray(target)
    if (sourceIsArray && targetIsArray) {
      source = source as Dynamic[]
      target = target as Dynamic[]
      const arrayDiff: Diff[] = []
      for (let i = 0; i < target.length; i++) {
        const diff = morphDynamic(source[i], target[i], i)
        if (diff) {
          source[i] = target[i]
          arrayDiff.push(diff)
        }
      }
      return arrayDiff.length === 0 ? false : [i, arrayDiff]
    }
    if (targetIsArray) {
      target = target as Dynamic[]
      const arrayDiff: Diff[] = dynamicsToDiff(target)
      return arrayDiff.length === 0 ? false : [i, arrayDiff]
    }

    // check for component
    const sourceIsComponent = typeof source === 'object' && source !== null
    const targetIsComponent = typeof target === 'object' && target !== null
    if (sourceIsComponent && targetIsComponent) {
      log('both component')
      const componentDiff = morphComponent(
        source as Component,
        target as Component,
      )
      if (componentDiff) {
        return [i, componentDiff]
      }
      return false
    }
    if (targetIsComponent) {
      log('target is component')
      target = target as Component
      components.set(target.selector, target)
      const componentDiff = morphComponent(createDummyComponent(), target)
      if (componentDiff) {
        return [i, componentDiff]
      }
      return false
    }

    // only primitive view left
    return [i, target as PrimitiveView]
  }

  function morphComponentDynamics(
    source: Component,
    target: Component,
  ): Diff[] {
    log('morph component dynamics, len:', target.dynamics.length)
    const diff: Diff[] = []
    for (let i = 0; i < target.dynamics.length; i++) {
      const dynamicDiff = morphDynamic(
        source.dynamics[i],
        target.dynamics[i],
        i,
      )
      if (dynamicDiff) {
        source.dynamics[i] = target.dynamics[i]
        diff.push(dynamicDiff)
      }
    }
    return diff
  }

  function morphComponent(
    source: Component,
    target: Component,
  ): ComponentDiff | false {
    log('morph component', {
      source: source.selector,
      target: target.selector,
      d: { source, target },
      t: JSON.stringify(target),
    })
    morphTemplate(source, target)
    const diff = morphComponentDynamics(source, target)
    if (
      diff.length === 0 &&
      source.selector === target.selector &&
      source.template_id === target.template_id
    ) {
      return false
    }
    const componentDiff: ComponentDiff = {
      s: target.selector,
      t: target.template_id,
      d: diff,
    }
    newComponents.set(source.selector, componentDiff)
    source.selector = target.selector
    source.template_id = target.template_id
    return componentDiff
  }

  morphComponent(source, target)

  const templatePatches: TemplatePatch[] = []
  for (const [template_id, statics] of newTemplates) {
    templatePatches.push({
      t: template_id,
      s: statics,
    })
  }
  return {
    t: templatePatches,
    c: Array.from(newComponents.values()),
    s: source.selector,
  }
}
