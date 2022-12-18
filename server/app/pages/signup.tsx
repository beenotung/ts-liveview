import { config } from '../../config.js'
import { commonTemplatePageDesc } from '../components/common-template.js'
import { Link } from '../components/router.js'
import Style from '../components/style.js'
import { o } from '../jsx/jsx.js'
import {
  appleLogo,
  facebookLogo,
  githubLogo,
  googleLogo,
  instagramLogo,
} from '../svgs/logo.js'

let style = Style(/* css */ `
.or-line::before,
.or-line::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #888;
  margin: 1rem 0.75rem;
}
.oauth-provider-list a {
  display: inline-flex;
  align-items: center;
  border: 1px solid #888;
  padding: 0.25rem;
  border-radius: 0.25rem;
  margin: 0.25rem;
}
#sign-up form p {
  color: darkred;
}
`)

let SignUp = (
  <div id="sign-up">
    {style}
    <h2>Sign up</h2>
    {commonTemplatePageDesc}
    <p>
      Welcome to {config.short_site_name}!
      <br />
      Let's begin the adventure~
    </p>
    <p>
      Already have an account? <Link href="/login">Sign in</Link>
    </p>
    <div class="flex-center flex-column">
      <div>Register with:</div>
      <div class="oauth-provider-list">
        <a>{googleLogo}&nbsp;Google</a>
        <a>{appleLogo}&nbsp;Apple</a>
        <a>{githubLogo}&nbsp;GitHub</a>
        <a>{facebookLogo}&nbsp;Facebook</a>
        <a>{instagramLogo}&nbsp;Instagram</a>
      </div>
    </div>
    <div class="or-line flex-center">or</div>
    <form>
      <label>
        Username
        <div class="input-container">
          <input name="username" />
        </div>
      </label>
      <p>This username is already used</p>
      <p>
        The username should only consist of english letters [a-z] and digits
        [0-9], hyphen [-] and underscore [_] are also allowed
      </p>
      <label>
        Email
        <div class="input-container">
          <input name="email" type="email" />
        </div>
      </label>
      <p>This email is invalid</p>
      <p>This email is already taken</p>
      <label>
        Password
        <div className="input-container">
          <input name="password" type="password" />
        </div>
      </label>
      <p>Password is too short</p>
      <p>Password may be compromised</p>
      <p>Password is strong</p>
      <label>
        Confirm password
        <div className="input-container">
          <input name="confirm_password" type="password" />
        </div>
      </label>
      <p>Password not matched</p>
    </form>
  </div>
)

export default { index: SignUp }
