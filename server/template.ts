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

function extractParams(text: string): string[] {
  let matches = text.match(/\{(.*)\}/g)
  if (!matches) {
    return []
  }
  return matches.map(match => match.replace('{', '').replace('}', ''))
}

export function buildTemplate(file: string) {
  let text = readFileSync(file).toString()
  let params = extractParams(text)
  let name = basename(file)
  name = JSON.stringify(name)
  let keys = params.map(name => JSON.stringify(name)).join(' | ')
  let code = `
export default type Template {
  [${name}]: 
}
`.trim()
}

if ('test') {
  buildTemplate(join('template', 'index.html'))
}
