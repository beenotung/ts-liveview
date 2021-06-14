import { Raw } from './raw.js'
import JSX from '../jsx/jsx.js'
import * as minify from 'minify'

export function Style(css: string) {
  if (process.env.NODE_ENV === 'production') {
    css = (minify as any).css(css)
  }
  return <style>{Raw(css)}</style>
}
