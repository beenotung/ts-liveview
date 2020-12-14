import path from 'path'
import { loadTemplateFile } from 'ts-liveview'

export type HTMLTemplateKey = 'title' | 'headInnerHTML' | 'bodyInnerHTML'
export let htmlTemplate = loadTemplateFile<HTMLTemplateKey>(
  path.join(__dirname, 'template.html'),
)
