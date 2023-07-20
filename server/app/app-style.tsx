import { config } from '../config.js'
import { ErrorStyle } from './components/error.js'
import { SourceCodeStyle } from './components/source-code.js'
import Style from './components/style.js'
import { UpdateMessageStyle } from './components/update-message.js'

export let style = Style(/* css */ `
${SourceCodeStyle}
${ErrorStyle}
${UpdateMessageStyle}

body {
  font-family: sans-serif;
}

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
