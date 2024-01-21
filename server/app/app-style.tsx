import { ErrorStyle } from './components/error.js'
import { SourceCodeStyle } from './components/source-code.js'
import Style from './components/style.js'
import { UpdateMessageStyle } from './components/update-message.js'
import { CommonStyle } from './styles/common-style.js'
import { MobileStyle } from './styles/mobile-style.js'

let appStyle = /* css */ `
${SourceCodeStyle}
${ErrorStyle}
${UpdateMessageStyle}
${CommonStyle}
`

export let ionicAppStyle = Style(appStyle + '\n' + MobileStyle)
