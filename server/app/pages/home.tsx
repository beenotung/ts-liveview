import { Link } from '../components/router.js'
import JSX from '../jsx/jsx.js'

export function Home() {
  return (
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
}
