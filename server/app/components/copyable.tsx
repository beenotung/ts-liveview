import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { Script } from './script.js'
import Style from './style.js'

let style = Style(/* css */ `
.copyable-container code {
  background-color: #eee;
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin: 0.25rem;
  display: block;
  width: fit-content;
  border: none;
}
.copyable-container button {
  margin: 0.25rem;
}
`)

export function Copyable(
  attrs: ({ code: Node } | { text: string }) & {
    buttonText?: string
    successText?: string
    successColor?: string
    errorText?: string
    errorColor?: string
    class?: string
  },
) {
  let code = 'code' in attrs ? attrs.code : <code>{attrs.text}</code>
  let buttonText = attrs.buttonText || 'Copy'
  let className = 'copyable-container'
  if (attrs.class) {
    className += ' ' + attrs.class
  }
  return (
    <>
      {style}
      <div class={className}>
        {code}
        <button
          onclick="copyToClipboard(event)"
          data-button-text={buttonText}
          data-success-text={attrs.successText || 'Copied to clipboard'}
          data-success-color={attrs.successColor || 'green'}
          data-error-text={
            attrs.errorText ||
            'Copy not supported, please select the text and copy manually.'
          }
          data-error-color={attrs.successColor || 'red'}
        >
          {buttonText}
        </button>
      </div>
      {script}
    </>
  )
}

let script = Script(/* javascript */ `
function copyToClipboard(event) {
  let button = event.target
  let code = button.parentElement.querySelector('code')
  try {
    let range = document.createRange()
    range.selectNode(code)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
    document.execCommand('copy')
    button.textContent = button.dataset.successText
    button.style.color = button.dataset.successColor
  } catch (e) {
    button.textContent = button.dataset.errorText
    button.style.color = button.dataset.errorColor
  }
  setTimeout(() => {
    button.textContent = button.dataset.buttonText
    button.style.color = ''
  }, 5000)
}
`)
