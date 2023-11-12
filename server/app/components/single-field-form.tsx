import { object, Parser, string } from 'cast.ts'
import { apiEndpointTitle } from '../../config.js'
import { DynamicContext, getContextFormBody } from '../context.js'
import { EarlyTerminate } from '../helpers.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { Routes } from '../routes.js'
import { OptionValue, Select, SelectOption } from './select.js'
import {
  UpdateMessage,
  newUpdateMessageId,
  sendUpdateMessage,
} from './update-message.js'

type FieldValue =
  | OptionValue
  | {
      options: SelectOption[]
      selected: OptionValue
    }

export function newSingleFieldForm<
  Name extends string = 'input',
  UpdateKeyField extends string = 'key',
  Input = Record<Name | UpdateKeyField, string>,
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
  updateMessageLabel?: string | false // short, for ACK message, pass false to skill ACK
  updateMessageId?: string
  updateKeyName?: UpdateKeyField // example: update-message-key, form field name of update message key if the <Form/> will be used multiple times (e.g. in mapArray)
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
    updateKeyName: updateKeyField,
    renderUpdate,
  } = attrs
  let method = attrs.method || 'POST'
  let name = attrs.name || 'input'
  let autocomplete = attrs.autocomplete === true ? undefined : 'off'
  let submitButton = attrs.submitButton ?? 'Save'
  let updateParser: Parser<Input> =
    attrs.updateParser ||
    (object(
      updateKeyField
        ? {
            [name]: string({ trim: true, nonEmpty: true }),
            [updateKeyField]: string(),
          }
        : {
            [name]: string({ trim: true, nonEmpty: true }),
          },
    ) as Parser<object> as Parser<Input>)
  let updateMessageLabel = attrs.updateMessageLabel ?? label
  let description = attrs.description || `update ${label}`

  let defaultUpdateMessageId = attrs.updateMessageId || newUpdateMessageId()

  function Form(attrs: {
    value: FieldValue
    type?: string
    extraFields?: Node
    class?: string
    formId?: string
    inputId?: string
    list?: string
    key?: string | number
  }) {
    let { value, type, extraFields, key } = attrs
    let isKeyed = updateKeyField && key != undefined
    let updateMessageId = isKeyed
      ? `${defaultUpdateMessageId}-${key}`
      : defaultUpdateMessageId
    let input =
      typeof value === 'object' ? (
        Select({
          id: attrs.inputId,
          name,
          autocomplete,
          options: value.options,
          value: value.selected,
          oninput: oninput,
          onchange: onchange,
        })
      ) : (
        <input
          id={attrs.inputId}
          list={attrs.list}
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
      <form
        method={method}
        action={action}
        onsubmit="emitForm(event)"
        class={attrs.class}
        id={attrs.formId}
      >
        {isKeyed ? <input name={updateKeyField} value={key} hidden /> : null}
        {extraFields}
        <label>
          {label}: {input}
        </label>{' '}
        {submitButton ? <input type="submit" value={submitButton} /> : null}
        {UpdateMessage({ id: updateMessageId })}
      </form>
    )
  }

  function Update(_attrs: {}, context: DynamicContext) {
    let body = getContextFormBody(context)
    let input = updateParser.parse(body)

    updateValue({ input }, context)

    if (updateMessageLabel && context.type === 'ws') {
      let id = updateKeyField
        ? defaultUpdateMessageId +
          '-' +
          (input as Record<UpdateKeyField, string>)[updateKeyField]
        : defaultUpdateMessageId
      sendUpdateMessage(
        { label: updateMessageLabel, selector: '#' + id },
        context,
      )
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
