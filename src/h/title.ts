import { Component, Dynamic } from '../h'

export function getComponentTitle(component: Component): string | undefined {
  return title_walker.getTitle(component)
}

namespace title_walker {
  type Context = {
    title?: string
  }

  export function getTitle(component: Component): string | undefined {
    const context: Context = {}
    walkComponent(context, component)
    return context.title
  }

  function walkComponent(context: Context, component: Component) {
    if (component.title) {
      context.title = component.title
    }
    walkDynamics(context, component.dynamics)
  }

  function walkDynamics(context: Context, dynamics: Dynamic[]) {
    dynamics.forEach(dynamic => walkDynamic(context, dynamic))
  }

  function walkDynamic(context: Context, dynamic: Dynamic) {
    if (!dynamic || typeof dynamic !== 'object') {
      return
    }
    if (Array.isArray(dynamic)) {
      walkDynamics(context, dynamic)
      return
    }
    walkComponent(context, dynamic)
  }
}
