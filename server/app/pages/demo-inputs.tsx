import { Style } from '../components/style.js'
import { o } from '../jsx/jsx.js'
import debug from 'debug'
import { title } from '../../config.js'
import { Routes } from '../routes.js'
import Menu from '../components/menu.js'
import { Switch } from '../components/router.js'
import DemoSelect from './demo-inputs/demo-select.js'
import DemoSingleFieldForm from './demo-inputs/demo-single-field-form.js'
import SourceCode from '../components/source-code.js'

const log = debug('demo-single-field-form.tsx')
log.enabled = true

let style = Style(/* css */ `
#demo-inputs .code-demo {
  display: flex;
  flex-wrap: wrap;
}
`)

let content = (
  <div id="demo-inputs">
    <h1>Input Components Demo</h1>
    <p>This page demo component based input fields.</p>

    {style}
    <link rel="stylesheet" href="/lib/prism/prism.css" />
    <script src="/lib/prism/prism.js"></script>

    <SourceCode page="demo-inputs.tsx" />

    <p>
      The example code snippets below are simplified for illustration. You can
      click "Source Code of [page]" to see the complete source code.
    </p>

    <fieldset>
      <legend>
        <Menu
          routes={[
            { url: '/inputs/select', menuText: '<Select/>' },
            {
              url: '/inputs/single-field-form',
              menuText: 'newSingleFieldForm()',
            },
          ]}
          separator=" | "
        />
      </legend>
      {Switch({
        '/inputs': DemoSelect,
        '/inputs/select': DemoSelect,
        '/inputs/single-field-form': DemoSingleFieldForm.content,
      })}
    </fieldset>
  </div>
)

let routes: Routes = {
  '/inputs': {
    title: title('Demo input components'),
    description: 'Demonstrate component-based input fields',
    menuText: 'Inputs',
    menuMatchPrefix: true,
    node: content,
  },
  '/inputs/select': {
    title: title('Demo <Select/> components'),
    description:
      'Demonstrate building select and option elements with <Select/>',
    node: content,
  },
  '/inputs/single-field-form': {
    title: title('Demo single-field-form component creator'),
    description: 'Demonstrate per-field saving with realtime update',
    node: content,
  },
  ...DemoSingleFieldForm.routes,
}

export default { routes }
