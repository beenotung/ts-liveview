import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { basename, extname, join } from 'path'

export function buildTemplate(file: string) {
  let name = file.slice(0, -extname(file).length)
  let dest = name + '.ts'
  name = basename(name)
  let codeName = name.replace(/-\w/g, match => match.slice(1).toUpperCase())
  let CodeName = codeName[0].toUpperCase() + codeName.slice(1)
  let html = readFileSync(file).toString()
  let matches = html.match(/\{(.*)\}/g) || []

  let type = `
export type ${CodeName}Options = {`
  let func = `
export function render${CodeName}Template(
  stream: HTMLStream,
  options: ${CodeName}Options,
): void {`
  for (let match of matches) {
    let key = match.slice(1, -1)
    type += `
  ${key}: string | HTMLFunc`
    let opt = 'options.' + key
    let [before, after] = html.split(match)
    html = after

    func += `
  stream.write(${toHTML(before)})
  typeof ${opt} == 'function' ? ${opt}(stream) : stream.write(${opt})`
  }
  if (html) {
    func += `
  stream.write(${toHTML(html)})`
  }

  let code = `
interface HTMLStream {
  write(chunk: string): void
  flush(): void
}
type HTMLFunc = (stream: HTMLStream) => void
${type}
}
${func}
}
`
  saveFile(dest, code.trim() + '\n')
}

function saveFile(file: string, content: string) {
  try {
    if (readFileSync(file).toString() == content) return
  } catch (error) {
    // maybe file not exists
  }
  writeFileSync(file, content)
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
