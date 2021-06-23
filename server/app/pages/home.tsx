import { Link } from '../components/router.js'
import JSX from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'

// The JSX expression don't need to be re-built on every render
let content = (
  <div id="home">
    <h2>Home Page</h2>
    <p>
      <Link href="/thermostat">Thermostat</Link>
    </p>
    <p>
      <Link href="/form">Form Demo</Link>
    </p>
  </div>
)

// And it can be pre-rendered into html as well
export let Home = prerender(content)
