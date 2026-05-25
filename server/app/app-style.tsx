import { ErrorStyle } from './components/error.js'
import { SourceCodeStyle } from './components/source-code.js'
import Style from './components/style.js'
import { UpdateMessageStyle } from './components/update-message.js'
import { CommonStyle } from './styles/common-style.js'
import { FormStyle } from './styles/form-style.js'
import { MobileStyle } from './styles/mobile-style.js'
import { WebStyle } from './styles/web-style.js'

let appStyle = /* css */ `
${SourceCodeStyle}
${ErrorStyle}
${UpdateMessageStyle}
${CommonStyle}
${FormStyle}
`

export let webAppStyle = Style(appStyle + '\n' + WebStyle)

export let ionicAppStyle = Style(appStyle + '\n' + MobileStyle)
