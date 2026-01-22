import { Context, getContextLanguage } from '../context.js'
import { o } from '../jsx/jsx.js'
import { mapArray } from './fragment.js'
import { languages } from './locale.js'
import { Script } from './script.js'
import { language_max_age } from './ui-language.js'

let script = Script(/* javascript */ `
function initLanguageRadioGroup(){
  let radioGroup = document.getElementById('languageRadioGroup')
  radioGroup.addEventListener('ionChange', async (event) => {
    let lang = event.detail.value
    document.cookie = 'lang=' + lang + ';SameSite=Lax;path=/;max-age=${language_max_age}'
    let url = '/set-lang/:lang'.replace(':lang', lang)
    let return_url = window.location.href.replace(location.origin, '')
    emit(url, return_url)
  })
}
initLanguageRadioGroup()
`)

export function LanguageRadioGroup(attrs: {}, context: Context) {
  let lang = getContextLanguage(context)
  return (
    <>
      <ion-radio-group id="languageRadioGroup" value={lang}>
        {mapArray(languages, lang => (
          <ion-item>
            <ion-radio value={lang.code}>{lang.name}</ion-radio>
          </ion-item>
        ))}
      </ion-radio-group>
      {script}
    </>
  )
}
