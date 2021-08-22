import { Link } from '../components/router.js'
import JSX from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import Comment from '../components/comment.js'

// The JSX expression don't need to be re-built on every render
let content = (
  <div id="home">
    <h2>Home Page</h2>
    <p>
      This website is a{' '}
      <b>
        hybrid <abbr title="Static Side Generation">SSG</abbr> and{' '}
        <abbr title="Server-Side Rendered">SSR</abbr> Realtime Web App
      </b>{' '}
      (also known as <b>SSR-SPA</b>).
    </p>
    <p>
      When the browser load this url, the server responses complete html content
      to the GET request. This allows the browser to perform meaningful paint as
      soon as possible. And it's ideal for SEO.
    </p>
    <p>
      Then the browser establishes websocket connection to receive realtime
      update from the server.
    </p>
    <p>
      The app logic is executed on the server, and the app state is kept on the
      server. (The input values are kept in the DOM before form submission.)
    </p>
    <p>
      As opposite to ts-liveview v1, the server does not maintain virtual dom
      for diff-patch. The UI is updated using query selector and AST/JSX.
      ts-liveview employs hybrid approach: the developer can specify the initial
      layout declaratively and applying event-driven partial layout update. This
      is like a crossover of <a href="https://reactjs.org/">React</a> and{' '}
      <a href="https://jquery.com/">jQuery</a>, taking a good-side of both
      worlds, balancing the developer experience (DX) and runtime efficient,
      which improve the user-experience (UX).
    </p>

    <h2>ts-liveview code snippet</h2>
    <p>You can either write in JSX or AST.</p>
    {Comment(`using table to align 3 code blocks with the same width`)}
    <table>
      <tbody>
        <tr>
          <td>
            <fieldset>
              <legend>JSX Example</legend>
              <code>{`<a href='#'>hash link</a>`}</code>
            </fieldset>
          </td>
        </tr>
        <tr>
          <td>
            <fieldset>
              <legend>AST Example</legend>
              <code>{`{['a', { href: '#' }, ['hash link']]}`}</code>
            </fieldset>
          </td>
        </tr>
        <tr>
          <td>
            <fieldset>
              <legend>HTML output</legend>
              <code>
                <a href="#">hash link</a>
              </code>
            </fieldset>
          </td>
        </tr>
      </tbody>
    </table>
    <p>
      Try some reactive demo: <Link href="/thermostat">Thermostat</Link>,{' '}
      <Link href="/form">Form Demo</Link>
    </p>
  </div>
)

// And it can be pre-rendered into html as well
export let Home = prerender(content)

export default Home
