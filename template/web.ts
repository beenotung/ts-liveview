interface HTMLStream {
  write(chunk: string): void
  flush(): void
}
type HTMLFunc = (stream: HTMLStream) => void

export type WebOptions = {
  title: string | HTMLFunc
  description: string | HTMLFunc
  site_name: string | HTMLFunc
  manifest_file: string | HTMLFunc
  app: string | HTMLFunc
}

export function renderWebTemplate(
  stream: HTMLStream,
  options: WebOptions,
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

    <!-- For Progressive Web App (PWA) -->
    <meta name="theme-color" content="#00ffee" />

    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-tap-highlight" content="no" />

    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="`)
  typeof options.site_name == 'function' ? options.site_name(stream) : stream.write(options.site_name)
  stream.write(/* html */ `" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />

    <meta http-equiv="x-ua-compatible" content="IE=Edge" />

    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="manifest" href="`)
  typeof options.manifest_file == 'function' ? options.manifest_file(stream) : stream.write(options.manifest_file)
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
      body {
        padding-bottom: 2.5rem;
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
      let template_name = 'web'
    </script>
    `)
  typeof options.app == 'function' ? options.app(stream) : stream.write(options.app)
  stream.write(/* html */ `
  </body>
</html>
`)
}
