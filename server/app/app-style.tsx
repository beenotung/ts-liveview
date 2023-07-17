import { config } from '../config.js'
import { ErrorStyle } from './components/error.js'
import { SourceCodeStyle } from './components/source-code.js'
import Style from './components/style.js'
import { UpdateMessageStyle } from './components/update-message.js'

export let utf8_style = /* css */ `
body {
  font-family: Arial, Helvetica, sans-serif;
}
`

export let style = Style(/* css */ `
${SourceCodeStyle}
${ErrorStyle}
${UpdateMessageStyle}

${config.english_only ? '' : utf8_style}

h1.title {
  color: darkblue;
}
h1.title a {
  font-size: 1rem;
}

[hidden] {
  display: none !important;
}

img {
  max-width: 100%;
  max-height: 100%;
}

code.inline-code {
  background: rgba(175, 184, 193, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

footer {
  border-top: 1px solid #aaa;
  padding-top: 0.5rem;
}
`)
