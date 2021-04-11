import JSX from '../../client/jsx.js'
import { Fragment } from '../dom.js'
import type { View } from './view'

type Props = { url: string }

export let pageNotFoundView: View<Props> = {
  initView: (
    <Fragment
      list={[<h1>404 Page Not Found</h1>, <a href="/">Back to Home Page</a>]}
    />
  ),
}

export let notImplemented: View<Props> = {
  initView: (
    <Fragment
      list={[<h1>Not Implemented</h1>, <a href="/">Back to Home Page</a>]}
    />
  ),
}
