import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export function loadTemplate<T extends object>(page: string) {
  let file = join('template', page + '.html')
  let template = readFileSync(file, 'utf-8')
  return (options: T) => renderTemplate(template, options)
}

export function renderTemplate<T extends object>(template: string, options: T) {
  Object.entries(options).forEach(([key, value]) => {
    template = template.replace(`{${key}}`, value)
  })
  return template
}
