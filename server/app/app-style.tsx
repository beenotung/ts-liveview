import { config } from '../config.js'
import { ErrorStyle } from './components/error.js'
import { SourceCodeStyle } from './components/source-code.js'
import Style from './components/style.js'
import { UpdateMessageStyle } from './components/update-message.js'
import { CommonStyle } from './styles/common.js'

export let style = Style(/* css */ `
${CommonStyle}
${SourceCodeStyle}
${ErrorStyle}
${UpdateMessageStyle}

body {
  font-family: sans-serif;
}

h1 { font-size: 2rem }
h2 { font-size: 1.8rem }
h3 { font-size: 1.75rem }
h4 { font-size: 1.5rem }
h5 { font-size: 1.25rem }
h6 { font-size: 1.2rem }
h1,h2,h3,h4,h5,h6 { margin: 1em 0 0.5em }

.text-no-wrap {
  display: inline-block;
  width: max-content;
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
`)
