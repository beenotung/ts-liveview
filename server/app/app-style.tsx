import { SourceCodeStyle } from './components/source-code.js'
import Style from './components/style.js'

export let style = Style(/* css */ `
.error {
  border: 1px solid red;
  padding: 0.75rem;
  width: fit-content;
}
h1.title {
  color: darkblue;
}
h1.title a {
  font-size: 1rem;
}
${SourceCodeStyle}
`)
