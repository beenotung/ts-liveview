import { ComboBox } from '../../components/combo-box.js'
import code from '../../components/inline-code.js'
import { Script } from '../../components/script.js'
import SourceCode from '../../components/source-code.js'
import { o } from '../../jsx/jsx.js'

let comboBox = code('<ComboBox/>')
let placeholder = code('placeholder')
let options = code('options')
let value = code('value')
let multiple = code('multiple')
let autoSet = code('auto-set')
let caseSensitive = code('case-sensitive')

let content = (
  <>
    <p>
      {comboBox} is a searchable dropdown component with single or multiple
      selection support. It provides a better user experience than native{' '}
      {code('<select>')} for long lists of options.
    </p>

    <h2>Basic Single Select</h2>
    <p>
      By default, {comboBox} allows single selection. Use {autoSet} to
      automatically set the input value when an option is selected.
    </p>
    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <code class="language-tsx" style="padding: 0.5rem">
          {
            /* html */ `
<ComboBox
  placeholder="Select a fruit..."
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]}
  auto-set="label"
  onchange="console.log('Selected:', event.detail.value)"
/>
`.trim()
          }
        </code>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <ComboBox
          id="demoComboSingle"
          placeholder="Select a fruit..."
          options={[
            { value: 'apple', label: 'Apple' },
            { value: 'banana', label: 'Banana' },
            { value: 'cherry', label: 'Cherry' },
            { value: 'date', label: 'Date' },
            { value: 'elderberry', label: 'Elderberry' },
          ]}
          auto-set="label"
          onchange="handleComboChange('demoComboSingle', 'demoComboSingleValue', event)"
        />
        <div style="margin-top: 0.5rem;">
          <strong>Selected value:</strong>{' '}
          <span id="demoComboSingleValue" style="color: #0054e9;">
            None
          </span>
        </div>
      </fieldset>
    </div>

    <h2>Multiple Selection</h2>
    <p>
      Set {multiple} attribute to allow selecting multiple options. The{' '}
      {code('event.detail.value')} will be an array of selected values. You can
      access the selected values programmatically using the {code('value')}{' '}
      property on the combo-box element.
    </p>
    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <code class="language-tsx" style="padding: 0.5rem">
          {
            /* html */ `
<ComboBox
  id="demoComboBox"
  placeholder="Select multiple colors..."
  options={[
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
  ]}
  multiple
  auto-set="label"
  onchange="console.log('Selected values:', event.detail.value)"
/>
<button onclick="console.log('Selected values:', demoComboBox.value)">
  Log Selected Values
</button>
`.trim()
          }
        </code>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <ComboBox
          id="demoComboMultiple"
          placeholder="Select multiple colors..."
          options={[
            { value: 'red', label: 'Red' },
            { value: 'green', label: 'Green' },
            { value: 'blue', label: 'Blue' },
            { value: 'yellow', label: 'Yellow' },
            { value: 'purple', label: 'Purple' },
          ]}
          multiple
          auto-set="label"
          onchange="handleComboChange('demoComboMultiple', 'demoComboMultipleValue', event)"
        />
        <div style="margin-top: 0.5rem;">
          <strong>Selected values:</strong>{' '}
          <span id="demoComboMultipleValue" style="color: #0054e9;">
            None
          </span>
        </div>
        <button
          style="margin-top: 0.5rem;"
          onclick="console.log('Selected values:', demoComboMultiple.value)"
        >
          Log Selected Values
        </button>
      </fieldset>
    </div>

    <h2>Search Behavior</h2>
    <p>
      By default, search matches against the <strong>label</strong>, not the{' '}
      {code('value')}. You can provide custom search text using the{' '}
      {code('search')} property to match alternative names or aliases.
    </p>
    <p>
      <strong>Example:</strong> With{' '}
      {code('search: "US USA United States America"')}, searching for any of
      these terms will match: "US", "USA", "United States", or "America".
    </p>
    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <code class="language-tsx" style="padding: 0.5rem">
          {
            /* html */ `
<ComboBox
  placeholder="Search countries..."
  options={[
    // search property allows matching multiple terms
    // Try searching: "US", "USA", "United States", or "America" - all will match
    { value: 'us', label: 'United States', search: 'US USA United States America' },
    { value: 'uk', label: 'United Kingdom', search: 'UK Britain United Kingdom' },
    { value: 'jp', label: 'Japan', search: 'JP Japan Nihon' },
  ]}
  auto-set="label"
  onchange="console.log('Selected:', event.detail.value)"
/>
`.trim()
          }
        </code>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <ComboBox
          id="demoComboSearch"
          placeholder="Search countries..."
          options={[
            {
              value: 'us',
              label: 'United States',
              search: 'US USA United States America',
            },
            {
              value: 'uk',
              label: 'United Kingdom',
              search: 'UK Britain United Kingdom',
            },
            { value: 'jp', label: 'Japan', search: 'JP Japan Nihon' },
            {
              value: 'kr',
              label: 'South Korea',
              search: 'Korea Republic South Korea',
            },
            { value: 'cn', label: 'China', search: 'China PRC Mainland' },
          ]}
          auto-set="label"
          onchange="handleComboChange('demoComboSearch', 'demoComboSearchValue', event)"
        />
        <div style="margin-top: 0.5rem;">
          <strong>Selected value:</strong>{' '}
          <span id="demoComboSearchValue" style="color: #0054e9;">
            None
          </span>
        </div>
      </fieldset>
    </div>

    <h2>Case Sensitive Search</h2>
    <p>
      By default, search is case-insensitive. Set {caseSensitive} attribute to
      enable case-sensitive matching.
    </p>
    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <code class="language-tsx" style="padding: 0.5rem">
          {
            /* html */ `
<ComboBox
  placeholder="Case sensitive search..."
  options={[
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'py', label: 'Python' },
  ]}
  case-sensitive
  auto-set="label"
  onchange="console.log('Selected:', event.detail.value)"
/>
`.trim()
          }
        </code>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <ComboBox
          id="demoComboCase"
          placeholder="Case sensitive search..."
          options={[
            { value: 'js', label: 'JavaScript' },
            { value: 'ts', label: 'TypeScript' },
            { value: 'py', label: 'Python' },
            { value: 'go', label: 'Go' },
            { value: 'rs', label: 'Rust' },
          ]}
          case-sensitive
          auto-set="label"
          onchange="handleComboChange('demoComboCase', 'demoComboCaseValue', event)"
        />
        <div style="margin-top: 0.5rem;">
          <strong>Selected value:</strong>{' '}
          <span id="demoComboCaseValue" style="color: #0054e9;">
            None
          </span>
        </div>
      </fieldset>
    </div>

    <h2>Auto-Set Value</h2>
    <p>
      Use {autoSet} with {code('"value"')} to set the input's value to the
      option's value instead of the label. This is useful when you need to
      submit the form with the actual value.
    </p>
    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <code class="language-tsx" style="padding: 0.5rem">
          {
            /* html */ `
<form id="demoForm">
  <ComboBox
    name="language"
    placeholder="Select programming language..."
    options={[
      { value: 'javascript', label: 'JavaScript' },
      { value: 'typescript', label: 'TypeScript' },
      { value: 'python', label: 'Python' },
    ]}
    auto-set="value"
    onchange="console.log('Form value:', demoForm.language.value)"
  />
</form>
`.trim()
          }
        </code>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <form id="demoForm">
          <ComboBox
            name="language"
            placeholder="Select programming language..."
            options={[
              { value: 'javascript', label: 'JavaScript' },
              { value: 'typescript', label: 'TypeScript' },
              { value: 'python', label: 'Python' },
              { value: 'java', label: 'Java' },
              { value: 'rust', label: 'Rust' },
            ]}
            auto-set="value"
            onchange="handleComboFormChange('demoForm', 'demoFormValue', event)"
          />
        </form>
        <div style="margin-top: 0.5rem;">
          <strong>Form value:</strong>{' '}
          <span id="demoFormValue" style="color: #0054e9;">
            None
          </span>
        </div>
        {Script(/* javascript */ `
// Check the form value
demoForm.addEventListener('submit', event => {
  event.preventDefault()
  console.log('Form submitted with language:', demoForm.language.value)
})
`)}
      </fieldset>
    </div>

    {Script(/* javascript */ `
function updateComboValue(wrapperId, displayId, values) {
  let display = document.getElementById(displayId)
  if (!display) return
  if (!values || values.length === 0) {
    display.textContent = 'None'
    return
  }
  if (Array.isArray(values)) {
    display.textContent = JSON.stringify(values)
  } else {
    display.textContent = String(values)
  }
}

function updateComboFormValue(formId, displayId, event) {
  let form = document.getElementById(formId)
  let display = document.getElementById(displayId)
  if (form && form.language && display) {
    display.textContent = form.language.value || 'None'
  }
}

// Helper to handle combo box change events safely
function handleComboChange(comboBoxId, displayId, event) {
  if (event && event.detail) {
    updateComboValue(comboBoxId, displayId, event.detail.value)
    console.log('Selected:', event.detail.value)
  } else {
    // Fallback: get value directly from combo-box element
    let comboBox = document.getElementById(comboBoxId)
    if (comboBox) {
      updateComboValue(comboBoxId, displayId, comboBox.value)
      console.log('Selected:', comboBox.value)
    }
  }
}

function handleComboFormChange(formId, displayId, event) {
  let form = document.getElementById(formId)
  if (form && form.language) {
    updateComboFormValue(formId, displayId, event)
    console.log('Form value:', form.language.value)
  }
}
`)}
    <SourceCode page="demo-inputs/demo-combo-box.tsx" />
  </>
)

export default content
