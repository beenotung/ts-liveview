import debug from 'debug'
import hash from 'quick-hash'
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
} & Template

export function c(selector: string, template: Template): Component {
  return {
    selector,
    ...template,
  }
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
          selector: dynamic.selector,
          template_id: dynamic.template_id,
          diff: dynamic.dynamics.map((dynamic, i) => dynamicToDiff(dynamic, i)),
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

  const templatePatches: TemplatePatch[] = []
  for (const [template_id, statics] of newTemplates) {
    templatePatches.push({ template_id, statics })
  }
  return {
    templates: templatePatches,
    components: Array.from(newComponents.values()),
    selector: source.selector,
  }
}
