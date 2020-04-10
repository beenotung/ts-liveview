import morphdom from 'morphdom'
import { DataSignal } from 's-js'

export type Value = string | number | boolean | undefined | null

function valueToString(value: Value): string {
  switch (typeof value) {
    case 'undefined':
      return ''
    case 'object':
      if (value === null) {
        return ''
      }
      return (value as object).toString()
    case 'boolean':
      return value ? 'true' : 'false'
    case 'number':
      return value.toString()
    case 'string':
      return value
    case 'function':
      return valueToString((value as () => Value)())
    case 'symbol':
      return (value as symbol).toString()
    case 'bigint':
      return (value as bigint).toString()
    default: {
      console.warn('unexpected type:', typeof value)
      return (value as any).toString()
    }
  }
}

export type Template = {
  statics: TemplateStringsArray,
  dynamics: Value[]
}

export function toHTML({ dynamics, statics }: Template) {
  let acc = ''
  let D = dynamics.length
  for (let i = 0; i < statics.length; i++) {
    acc += statics[i]
    if (i < D) {
      acc += valueToString(dynamics[i])
    }
  }
  return acc
}

export function h(statics: TemplateStringsArray, ...dynamics: Value[]): Template {
  return {
    statics,
    dynamics,
  }
}

function updateSignal(event: Event, name: string) {
  let signal = (window as any).signals[name]
  signal((event.target as HTMLInputElement).value)
}

export function render(host: Element, template: Template, signals?: Record<string, DataSignal<any>>) {
  if (signals) {
    Object.assign(window, {
      signals,
      updateSignal,
    })
  }
  let target = toHTML(template)
  morphdom(host, target)
}

export function isTemplateSame(a: TemplateStringsArray, b: TemplateStringsArray): boolean {
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

export type Diff = Array<[number, Value]>

export function diff(source: Value[], target: Value[]): Diff {
  const diff: Diff = []
  for (let i = 0; i < target.length; i++) {
    let s = source[i]
    let t = target[i]
    if (s !== t) {
      diff.push([i, t])
    }
  }
  return diff
}
