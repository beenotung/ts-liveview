import { o } from './jsx/jsx.js'
import { Raw } from './components/raw.js'
import Style from './components/style.js'
import { Script } from './components/script.js'
import { Node } from './jsx/types.js'
import { prerender } from './jsx/html.js'

let headMeta = prerender(
  <>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=6.0"
    />
  </>,
)

let noscriptStyle = Style(/* css */ `
#noscript {
  margin: 1em;
  padding: 1em;
  outline: 1px solid red;
}
`)

let bodyStyle = Style(/* css */ `
#ws_status {
  position: fixed;
  top: 1em;
  right: 1em;
  padding: 0.25em;
  background: white;
  border: 1px solid black;
  border-radius: 0.2em;
}
abbr[title]:after {
  content: ' (' attr(title) ')';
}
@media screen and (min-width: 1025px) {
  abbr[title]:after {
    content: '';
  }
}
.dark-theme {
  filter: invert();
  background-color: black;
}
`)

let bodyScript = Script(/* javascript */ `
document.getElementById('noscript').remove();
document.getElementById('ws_status').removeAttribute('hidden');
`)

export function Template(attrs: {
  title: string
  description: string
  app: Node
}) {
  return (
    <>
      {Raw(`<!DOCTYPE html>`)}
      <html lang="en">
        <head>
          {headMeta}
          <title>{attrs.title}</title>
          <meta name="description" content={attrs.description} />
        </head>
        <body>
          <div id="noscript" aria-hidden="true">
            {noscriptStyle}
            Javascript is not enabled. This site can still works but it'll be
            more interactive when javascript is enabled.
          </div>
          {bodyStyle}
          <div id="ws_status" hidden role="none">
            loading...
          </div>
          {bodyScript}
          {attrs.app}
        </body>
      </html>
    </>
  )
}
