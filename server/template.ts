import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { basename, extname, join } from 'path'

export function buildTemplate(file: string) {
  let name = file.slice(0, -extname(file).length)
  let dest = name + '.ts'
  name = basename(name)
  let html = readFileSync(file).toString()
  let matches = html.match(/\{(.*)\}/g) || []
  let keys = matches.map(match => match.slice(1, -1))
  console.log(keys)
  let type = `export type ${name}Options = {`
  let func = `export function ${name}Template(options: ${name}Options): string {
  return ''`
  for (let match of matches) {
    let key = match.slice(1, -1)
    type += `
  ${key}: string`
    let [before, after] = html.split(match)
    func += ' + ' + toHTML(before) + ` + options.${key}`
    html = after
  }
  let code = `
${type}
}
${func} + ${toHTML(html)}
}`
  writeFileSync(dest, code.trim() + '\n')
}

function toHTML(html: string): string {
  if (html.includes('`')) {
    return JSON.stringify(html)
  }
  return '/* html */ `' + html + '`'
}

export function scanTemplateDir(dir: string) {
  for (let filename of readdirSync(dir)) {
    let file = join(dir, filename)
    if (extname(file) == '.html') {
      buildTemplate(file)
    }
  }
}
