import { title } from '../../config.js'
import { mapArray } from '../components/fragment.js'
import { newSingleFieldForm } from '../components/single-field-form.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'

let Nickname = newSingleFieldForm({
  action: '/name-list/update',
  label: 'Nickname',
  name: 'nickname',
  updateKeyName: 'index',
  updateValue(attrs, context) {
    const { index, nickname } = attrs.input
    names[+index] = nickname
  },
  renderUpdate(attrs, context) {
    return content
  },
})

let names = ['alice', 'bob', 'charlie']

let content = (
  <div>
    <h1>List Editing Demo</h1>
    <View />
  </div>
)

function View() {
  return mapArray(names, (name, index) => (
    <Nickname.Form key={index} value={name} />
  ))
}

let routes: Routes = {
  '/name-list': {
    title: title('Demo List Editing'),
    description:
      'Demo list editing with newSingleFieldForm powered by ts-liveview',
    menuText: 'List Editing',
    node: content,
  },
  ...Nickname.routes,
}

export default { routes }
