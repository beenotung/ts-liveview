import JSX from '../../client/jsx.js'
import { Fragment } from '../components/fragment.js'
import type { View } from './view'

type Props = { url: string }

export let pageNotFoundView: View<Props> = {
  initView: (
    <Fragment>
      <h1>404 Page Not Found</h1>
      <a href="/">Back to Home Page</a>
    </Fragment>
  ),
}

export let notImplemented: View<Props> = {
  initView: (
    <Fragment>
      <h1>Not Implemented</h1>
      <a href="/">Back to Home Page</a>
    </Fragment>
  ),
}
