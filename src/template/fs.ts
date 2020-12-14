import { readFileSync } from 'fs'
import { HTMLTemplate } from './html'

export function loadTemplateFile<Keys extends string>(file: string) {
  return new HTMLTemplate<Keys>(readFileSync(file, 'utf-8'))
}
