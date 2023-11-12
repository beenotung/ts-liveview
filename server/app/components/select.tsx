import { VElement, VNodeList } from '../../../client/jsx/types.js'
import { o } from '../jsx/jsx.js'
import { attrs } from '../jsx/types.js'

export type OptionValue = string | number

export type SelectOption =
  | OptionValue
  | { value: OptionValue; text: OptionValue }

export function Select<
  Attrs extends {
    name?: string
    placeholder?: string
    options: SelectOption[]
    value?: OptionValue | null
  } & attrs,
>(attrs: Attrs): VElement {
  let { value, placeholder, options, ...selectAttrs } = attrs

  let nodes: VNodeList = []

  if (typeof placeholder === 'string') {
    nodes.push(
      <option disabled selected={value ? undefined : ''} value="">
        {placeholder}
      </option>,
    )
  }

  for (let option of options) {
    if (typeof option === 'object') {
      nodes.push(
        <option
          selected={value == option.value ? '' : undefined}
          value={option.value}
        >
          {option.text}
        </option>,
      )
    } else {
      nodes.push(
        <option selected={value == option ? '' : undefined}>{option}</option>,
      )
    }
  }

  return ['select', selectAttrs, nodes]
}
