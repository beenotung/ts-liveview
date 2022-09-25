import { ErrorStyle } from './components/error.js'
import { SourceCodeStyle } from './components/source-code.js'
import Style from './components/style.js'

export let style = Style(/* css */ `
${ErrorStyle}
h1.title {
  color: darkblue;
}
h1.title a {
  font-size: 1rem;
}
${SourceCodeStyle}
`)
