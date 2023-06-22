import { object, Parser, string } from 'cast.ts'
import { apiEndpointTitle } from '../../config.js'
import { DynamicContext, getContextFormBody } from '../context.js'
import { EarlyTerminate } from '../helpers.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { Routes } from '../routes.js'
import { OptionValue, Select, SelectOption } from './select.js'
import { newUpdateMessage } from './update-message.js'

type FieldValue =
  | OptionValue
  | {
      options: SelectOption[]
      selected: OptionValue
    }

export function newSingleFieldForm<
  Name extends string = 'input',
  Input = Record<Name, string>,
>(attrs: {
  // for <Form/>
  method?: string // default: POST
  action: string
  label: string // full, for view & edit
  name?: Name
  placeholder?: string
  autocomplete?: boolean // default: off
  oninput?: string
  onchange?: string
  submitButton?: string | false // default: Save, pass false to skip the button
  // for <Update/>
  updateParser?: Parser<Input>
  updateMessageLabel?: string // short, for ACK message
  updateValue: (attrs: { input: Input }, context: DynamicContext) => void
  renderUpdate: (attrs: { input: Input }, context: DynamicContext) => Node
  // for route
  description?: string
}) {
  let {
    action,
    label,
    placeholder,
    oninput,
    onchange,
    updateValue,
    renderUpdate,
  } = attrs
  let method = attrs.method || 'POST'
  let name = attrs.name || 'input'
  let autocomplete = attrs.autocomplete === true ? undefined : 'off'
  let submitButton = attrs.submitButton ?? 'Save'
  let updateParser: Parser<Input> =
    attrs.updateParser ||
    (object({ [name]: string({ trim: true, nonEmpty: true }) }) as Parser<any>)
  let updateMessageLabel = attrs.updateMessageLabel || label
  let description = attrs.description || `update ${label}`

  let updateMessage = newUpdateMessage()

  function Form(attrs: {
    value: FieldValue
    type?: string
    extraFields?: Node
    submitOnInput?: boolean
    submitOnUpdate?: boolean
  }) {
    let { value, type, extraFields } = attrs
    let input =
      typeof value === 'object' ? (
        Select({
          name,
          autocomplete,
          options: value.options,
          value: value.selected,
          oninput: oninput,
          onchange: onchange,
        })
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          autocomplete={autocomplete}
          oninput={oninput}
          onchange={onchange}
        />
      )
    return (
      <form method={method} action={action} onsubmit="emitForm(event)">
        {extraFields}
        <label>
          {label}: {input}
        </label>{' '}
        {submitButton ? <input type="submit" value={submitButton} /> : null}
        {updateMessage.node}
      </form>
    )
  }

  function Update(attrs: {}, context: DynamicContext) {
    let body = getContextFormBody(context)
    let input = updateParser.parse(body)

    updateValue({ input }, context)

    if (context.type === 'ws') {
      updateMessage.sendWsUpdate({ label: updateMessageLabel }, context)
      throw EarlyTerminate
    }

    return renderUpdate({ input }, context)
  }

  let routes: Routes = {
    [action]: {
      title: apiEndpointTitle,
      description,
      node: <Update />,
    },
  }

  return { Form, Update, routes }
}
