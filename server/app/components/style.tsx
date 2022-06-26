import { config } from '../../config.js'
import { Raw } from './raw.js'
import { o } from '../jsx/jsx.js'
import * as minify from 'minify'

type MinifyType = {
  minify: {
    css(code: string): string
  }
}

export function Style(css: string) {
  if (config.production) {
    css = (minify as unknown as MinifyType).minify.css(css)
  }
  return <style>{Raw(css)}</style>
}

export default Style
