import { mapArray } from '../../components/fragment.js'
import code from '../../components/inline-code.js'
import { Script } from '../../components/script.js'
import { Select } from '../../components/select.js'
import SourceCode from '../../components/source-code.js'
import { CodeBlock } from '../../components/code-block.js'
import { o } from '../../jsx/jsx.js'

let select = code('<select>')
let option = code('<option>')
let placeholder = code('placeholder')
let value = code('value')

let fruitNames = ['apple', 'banana', 'cherry']
let fruitOptions = fruitNames.map((text, index) => ({ value: index + 1, text }))
let fruitRows = fruitNames.map((name, index) => ({ id: index + 1, name }))

let record = { fruit: 'cherry', fruit_id: 3 }

let content = (
  <>
    <p>
      {code('<Select/>')} is a function component that construct native {select}{' '}
      and {option} elements.
    </p>

    <p>
      It is intuitive to develop with native html {code('<input>')}. However,
      populating the value of {select} and {option} is getting verbose because{' '}
      {select} doesn't apply the value from the {value} attribute and{' '}
      {placeholder} attributes.
    </p>

    <h2>Approach with {code('<Select/>')} component</h2>

    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <CodeBlock
          style="padding: 0.5rem"
          code={
            /* html */ `
<form>
  <Select
    name="fruit"
    placeholder="select a fruit"
    value={record.fruit_id}
    options={fruitOptions}
  />
</form>
`.trim()
          }
        ></CodeBlock>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <form>
          <Select
            name="fruit"
            placeholder="select a fruit"
            value={record.fruit_id}
            options={fruitOptions}
          />
        </form>
      </fieldset>
    </div>

    <h2>Approaches without component</h2>

    <h3>
      Workaround of {placeholder} for {select}
    </h3>
    <p>
      A workaround to display {placeholder} for {select} is to put a disabled{' '}
      {option} with empty value.
    </p>
    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <CodeBlock
          style="padding: 0.5rem"
          code={
            /* html */ `
<select autocomplete="off">
  <option disabled selected value="" >
    select a fruit
  </option>
  <option>apple</option>
  <option>banana</option>
  <option>cherry</option>
</select>
`.trim()
          }
        ></CodeBlock>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <select autocomplete="off">
          <option disabled selected value="">
            select a fruit
          </option>
          <option>apple</option>
          <option>banana</option>
          <option>cherry</option>
        </select>
      </fieldset>
    </div>

    <h3>
      Workarounds of {value} for {select}
    </h3>

    <p>
      One approach is to set the value of select field with inline javascript.
      However this approach require client-side javascript to function. Also,
      the form id should be carefully picked to avoid name clash.
    </p>
    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <CodeBlock
          style="padding: 0.5rem"
          code={
            /* html */ `
 <form id="demoForm">
  <select name="fruit">
    <option>apple</option>
    <option>banana</option>
    <option>cherry</option>
  </select>
</form>
{Script(\`demoForm.fruit.value=\${JSON.stringify(record.fruit)}\`)}
`.trim()
          }
        ></CodeBlock>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <form id="demoForm">
          <select name="fruit">
            <option>apple</option>
            <option>banana</option>
            <option>cherry</option>
          </select>
        </form>
        {Script(`demoForm.fruit.value=${JSON.stringify(record.fruit)}`)}
      </fieldset>
    </div>

    <p>
      Another approach is to render each {option} conditionally (on server
      side). This version doesn't require form id and client-side javascript but
      it is rather verbose.
    </p>
    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <CodeBlock
          style="padding: 0.5rem"
          code={
            /* html */ `
 <form>
  <select name="fruit">
    {mapArray(fruitNames, name => (
      <option selected={name == record.fruit ? '' : undefined}>
        {name}
      </option>
    ))}
  </select>
</form>
`.trim()
          }
        ></CodeBlock>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <form>
          <select name="fruit">
            {mapArray(fruitNames, name => (
              <option selected={name == record.fruit ? '' : undefined}>
                {name}
              </option>
            ))}
          </select>
        </form>
      </fieldset>
    </div>

    <p>
      The verbosity adds up when the option text and option value are different.
    </p>
    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <CodeBlock
          style="padding: 0.5rem"
          code={
            /* html */ `
 <form>
  <select name="fruit">
    {mapArray(fruitRows, fruit => (
      <option
        value={fruit.id}
        selected={fruit.id == record.fruit_id ? '' : undefined}
      >
        {fruit.name}
      </option>
    ))}
  </select>
</form>
`.trim()
          }
        ></CodeBlock>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <form>
          <select name="fruit">
            {mapArray(fruitRows, fruit => (
              <option
                value={fruit.id}
                selected={fruit.id == record.fruit_id ? '' : undefined}
              >
                {fruit.name}
              </option>
            ))}
          </select>
        </form>
      </fieldset>

      <p>
        The {code('<Select/>')} component takes care of setting up the {option}{' '}
        based on the {value} attribute and the optional {placeholder} attribute
        without requiring client-side javascript. So you can enjoy React-like DX
        without running javascript on the client side.
      </p>
    </div>

    <SourceCode page="demo-inputs/demo-select.tsx" />
  </>
)

export default content
