import JSX from '../../client/jsx.js'
import { Raw } from './raw.js'

export function Style(props: { css: string }) {
  let css = props.css
  if (process.env.NODE_ENV === 'prod') {
    css = css
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n')
  } else {
    css = css.trim()
  }
  return (
    <style>
      <Raw html={css} />
    </style>
  )
}
