import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { Button } from './button.js'
import { mapArray } from './fragment.js'
import { IonButton } from './ion-button.js'
import { Script } from './script.js'
import Style from './style.js'

export let ComboBoxStyle = Style(/* css */ `
.combo-box {
  display: inline-flex;
  position: relative;

  --option-background-color: var(--ion-color-dark-contrast, var(--primary-background-color, #ffffff));
  --option-background-color-hover: var(--ion-color-light, var(--primary-background-color-hover, #f0f0f0));
  --option-text-color: var(--ion-color-dark, var(--primary-text-color, #000000));

  --selected-background-color: var(--ion-color-primary, var(--primary-color, #0054e9));
  --selected-background-color-hover: var(--ion-color-primary-shade, var(--primary-color-hover, #004acd));
  --selected-text-color: var(--ion-color-primary-contrast, var(--primary-text-color, #ffffff));
}
.combo-box--options {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  min-width: 100%;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 1;
  display: none;
}
.combo-box.active .combo-box--options {
  display: block;
}
.combo-box--input {
}
.combo-box--option {
  padding: 0.5rem;
  background-color: var(--option-background-color);
  color: var(--option-text-color);
}
.combo-box--option:hover {
  background-color: var(--option-background-color-hover);
}
.combo-box--option-selected {
  background-color: var(--selected-background-color);
  color: var(--selected-text-color);
}
.combo-box--option-selected:hover {
  background-color: var(--selected-background-color-hover);
}
`)

export let ComboBoxScript = Script(/* javascript */ `
function comboBoxToggleOption(event) {
  let option = event.target.closest('.combo-box--option')
  option.classList.toggle('combo-box--option-selected')

  let comboBox = option.closest('.combo-box')
  let customEvent = new CustomEvent('change', {
    detail: {
      value: comboBox.value,
      option: getComboBoxOptionValue(option),
      selected: option.classList.contains('combo-box--option-selected'),
    },
  })
  comboBox.dispatchEvent(customEvent, {
    bubbles: true,
    composed: true,
    cancelable: true,
  })
}

function getComboBoxOptionValue(option) {
  let value = option.getAttribute('data-value')
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

function comboBoxSearch(event) {
  let input = event.target
  let searchText = input.value
  let options = input.closest('.combo-box').querySelectorAll(
    '.combo-box--option[data-search]'
  )
  for (let option of options) {
    let search = option.getAttribute('data-search')
    option.hidden = !search.includes(searchText)
  }
}

function clearComboBox(event) {
  let comboBox = event.target.closest('.combo-box')
  let input = comboBox.querySelector('.combo-box--input')
  input.value = ''
  let options = comboBox.querySelectorAll('.combo-box--option')
  for (let option of options) {
    option.hidden = false
  }
}

// auto hide combo box options when clicking outside
window.addEventListener('click', event => {
  let target = event.target
  let comboBox = target.closest('.combo-box')
  if (comboBox) return
  let boxes = document.querySelectorAll('.combo-box')
  for (let box of boxes) {
    box.classList.remove('active')
  }
})

function showComboBoxOptions(event) {
  let input = event.target
  let comboBox = input.closest('.combo-box')
  comboBox.classList.add('active')

  let boxes = document.querySelectorAll('.combo-box')
  for (let box of boxes) {
    if (box === comboBox) continue
    box.classList.remove('active')
  }
}

function hideComboBoxOptions(event) {
  let input = event.target
  let comboBox = input.closest('.combo-box')
  comboBox.classList.remove('active')
}

if (!window.ComboBox) {
  class ComboBox extends HTMLElement {
    constructor() {
      super()
    }
    get value() {
      let selectedOptions = this.querySelectorAll('.combo-box--option-selected')
      return Array.from(
        selectedOptions,
        option => getComboBoxOptionValue(option)
      )
    }
  }
  window.ComboBox = ComboBox
  customElements.define('combo-box', ComboBox)
}
`)

export function ComboBox(attrs: {
  options: {
    value: string | number
    label?: Node
    /** fallback to use label if it's a string, or use value */
    search?: string
  }[]
  onchange?: string
  style?: string
  class?: string
  skipAssets?: boolean
  placeholder?: string
}) {
  let { skipAssets } = attrs
  let className = 'combo-box'
  if (attrs.class) {
    className += ' ' + attrs.class
  }
  return (
    <>
      {skipAssets ? null : ComboBoxStyle}
      <combo-box
        class={className}
        style={attrs.style}
        onchange={attrs.onchange}
      >
        <input
          class="combo-box--input"
          oninput="comboBoxSearch(event); showComboBoxOptions(event)"
          onclick="showComboBoxOptions(event)"
          placeholder={attrs.placeholder}
        />
        <ion-button size="small" onclick="clearComboBox(event)">
          <ion-icon name="close"></ion-icon>
        </ion-button>
        <div class="combo-box--options">
          {mapArray(attrs.options, option => {
            let label = option.label ?? option.value
            let search: string =
              option.search ??
              (typeof label === 'string' ? label : String(option.value))
            return (
              <div
                class="combo-box--option"
                onclick="comboBoxToggleOption(event)"
                data-value={option.value}
                data-search={search}
              >
                {label}
              </div>
            )
          })}
        </div>
      </combo-box>
      {skipAssets ? null : ComboBoxScript}
    </>
  )
}

export default ComboBox
