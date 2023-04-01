import { ErrorStyle } from './components/error.js'
import { SourceCodeStyle } from './components/source-code.js'
import Style from './components/style.js'

export let style = Style(/* css */ `
${SourceCodeStyle}
${ErrorStyle}
h1.title {
  color: darkblue;
}
h1.title a {
  font-size: 1rem;
}
[hidden] {
  display: none !important;
}
code.inline-code {
  background: rgba(175, 184, 193, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
}
`)
