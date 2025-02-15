import { config, LayoutType } from '../../config.js'
import { Context } from '../context.js'
import { o } from '../jsx/jsx.js'

export type ValidateResult =
  | { type: 'error'; text: string; extra?: string }
  | { type: 'ok'; text: string; extra?: string }

export type InputContext<ValidateResult> = Context & {
  contextError?: Record<string, ValidateResult>
  values?: Record<string, string | null>
}

export function Field(
  attrs: {
    label: string
    type?: string
    name: string
    oninput?: string
    msgId: string
    autocomplete?: string
    required?: boolean
    onchange?: string
  },
  context: InputContext<ValidateResult>,
) {
  let value = context.values?.[attrs.name]
  let validateResult = context.contextError?.[attrs.msgId]
  if (config.layout_type === LayoutType.ionic) {
    return (
      <>
        <ion-item>
          <ion-input
            type={attrs.type}
            name={attrs.name}
            oninput={attrs.oninput}
            value={value}
            autocomplete={attrs.autocomplete}
            label={attrs.label}
            label-placement="floating"
            required={attrs.required}
            onchange={attrs.onchange}
          />
        </ion-item>
        <div style="margin-inline-start: 1rem">
          {renderErrorMessage(attrs.msgId, validateResult)}
        </div>
      </>
    )
  }
  return (
    <div class="field">
      <label>
        {attrs.label}
        <div class="input-container">
          <input
            type={attrs.type}
            name={attrs.name}
            oninput={attrs.oninput}
            value={value}
            autocomplete={attrs.autocomplete}
            required={attrs.required}
            onchange={attrs.onchange}
          />
        </div>
      </label>
      <div class="space"></div>
      {renderErrorMessage(attrs.msgId, validateResult)}
    </div>
  )
}

export function ClearInputContext(_attrs: {}, context: InputContext<any>) {
  context.contextError = undefined
  context.values = undefined
}

function renderErrorMessage(id: string, result: ValidateResult | undefined) {
  if (!result) {
    return <div id={id} class="msg"></div>
  }

  return (
    <div
      id={id}
      class="msg"
      style={result.type == 'ok' ? 'color:green' : 'color:red'}
    >
      {result.text}
      {result.extra && <span class="extra">{result.extra}</span>}
    </div>
  )
}
