import { config } from '../../config.js'
import { commonTemplatePageText } from '../components/common-template.js'
import { Link } from '../components/router.js'
import { o } from '../jsx/jsx.js'

let SignIn = (
  <div id="sign-in">
    <h2>Sign in to {config.short_site_name}</h2>
    <p>{commonTemplatePageText}</p>
    <form>
      <label>
        Username or email address
        <div class="input-container">
          <input name="login" />
        </div>
      </label>
      <label>
        Password
        <div class="input-container">
          <input name="password" type="password" />
        </div>
      </label>
      <div class="input-container">
        <input type="submit" value="Sign in" />
      </div>
    </form>
    <div>
      New to {config.short_site_name}?{' '}
      <Link href="/signup">Create an account</Link>.
    </div>
  </div>
)

export default { index: SignIn }
