import JSX from '../client/jsx.js'
import { Raw } from './dom.js'

export function Style(props: { css: string }) {
  let css = props.css.trim()
  return (
    <style>
      <Raw html={css} />
    </style>
  )
}
