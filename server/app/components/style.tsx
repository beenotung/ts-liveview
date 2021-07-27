import { config } from '../../config.js'
import { Raw } from './raw.js'
import JSX from '../jsx/jsx.js'
import minify from 'minify'

export function Style(css: string) {
  if (config.production) {
    css = (minify as any).css(css)
  }
  return <style>{Raw(css)}</style>
}
