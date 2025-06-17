interface HTMLStream {
  write(chunk: string): void
  flush(): void
}
type HTMLFunc = (stream: HTMLStream) => void

export type IonicOptions = {
  title: string | HTMLFunc
  description: string | HTMLFunc
  app: string | HTMLFunc
}

export function renderIonicTemplate(
  stream: HTMLStream,
  options: IonicOptions,
): void {
  stream.write(/* html */ `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=6.0"
    />
    <title>`)
  typeof options.title == 'function' ? options.title(stream) : stream.write(options.title)
  stream.write(/* html */ `</title>
    <meta name="description" content="`)
  typeof options.description == 'function' ? options.description(stream) : stream.write(options.description)
  stream.write(/* html */ `" />
  </head>
  <body>
    <div id="noscript" aria-hidden="true">
      <style>
        #noscript {
          margin: 1em;
          padding: 1em;
          outline: 1px solid red;
        }
      </style>
      Javascript is not enabled. This site can still works but it'll be more
      interactive when javascript is enabled.
    </div>
    <style>
      #noscript {
        display: none;
      }
      #ws_status {
        position: fixed;
        bottom: 1em;
        left: 1em;
        padding: 0.25em;
        background: white;
        border: 1px solid black;
        border-radius: 0.2em;
        z-index: 1;
      }
      #ws_status:hover {
        opacity: 0.2;
        user-select: none;
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
    </style>
    <div id="ws_status" hidden role="none">loading...</div>
    <script>
      document.getElementById('noscript').remove()
      document.getElementById('ws_status').removeAttribute('hidden')
      let template_name = 'ionic'
    </script>
    <script
      type="module"
      src="/npm/@ionic/core/dist/ionic/ionic.esm.js"
    ></script>
    <script nomodule src="/npm/@ionic/core/dist/ionic/ionic.js"></script>
    <link rel="stylesheet" href="/npm/@ionic/core/css/ionic.bundle.css" />
    <style>
      .md .ios-only {
        display: none;
      }
      .ios .md-only {
        display: none;
      }
    </style>
    `)
  typeof options.app == 'function' ? options.app(stream) : stream.write(options.app)
  stream.write(/* html */ `
  </body>
</html>
`)
}
