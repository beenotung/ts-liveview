import { o } from '../jsx/jsx.js'
import {
  appleLogo,
  facebookLogo,
  githubLogo,
  googleLogo,
  instagramLogo,
} from '../svgs/logo.js'
import Style from './style.js'

let style = Style(/* css */ `
.oauth-provider-list a {
  display: inline-flex;
  align-items: center;
  border: 1px solid #888;
  padding: 0.25rem;
  border-radius: 0.25rem;
  margin: 0.25rem;
}
`)

export let oauthProviderList = (
  <>
    {style}
    <div class="oauth-provider-list">
      <a>{googleLogo}&nbsp;Google</a>
      <a>{appleLogo}&nbsp;Apple</a>
      <a>{githubLogo}&nbsp;GitHub</a>
      <a>{facebookLogo}&nbsp;Facebook</a>
      <a>{instagramLogo}&nbsp;Instagram</a>
    </div>
  </>
)
