import { o } from '../jsx/jsx.js'
import type { DynamicPageRoute } from '../routes'

export let avatar_url = 'https://www.w3schools.com/w3css/img_avatar.png'

export let avatar = (
  <img src={avatar_url} alt="placeholder" style="width:100%" />
)

export let placeholderForAttachRoutes: DynamicPageRoute = {
  resolve() {
    throw new Error('This route is placeholder for attachRoutes')
  },
}
