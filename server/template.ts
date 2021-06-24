import { readFileSync } from 'fs'
import { writeFileSync } from 'fs'
import { join, basename, extname } from 'path'
import { inspect } from 'util'

export function toTemplateFile(page: string) {
  return join('template', page + '.html')
}

export function loadTemplate<T extends object>(page_or_file: string) {
  let file = page_or_file.endsWith('.html')
    ? page_or_file
    : toTemplateFile(page_or_file)
  genTemplateType(file)
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

function calcTemplateName(file: string): string {
  file = basename(file)
  file = file.replace(extname(file), '')
  file = file.replace(/-/g, '_')
  return file
}

export function genTemplateType(
  file: string,
  name: string = calcTemplateName(file),
) {
  let text = readFileSync(file).toString()
  let params = extractParams(text)
  let keys = params.map(name => inspect(name)).join(' | ')
  let code = `
export type ${name}_key = ${keys}
export type ${name} = Record<${name}_key, string | number>
`.trim()
  writeFileSync(file + '.ts', code + '\n')
}
