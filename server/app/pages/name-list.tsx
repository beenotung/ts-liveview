import { title } from '../../config.js'
import { mapArray } from '../components/fragment.js'
import { newSingleFieldForm } from '../components/single-field-form.js'
import SourceCode from '../components/source-code.js'
import Style from '../components/style.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'

let style = Style(/* css */ `
#name-list legend {
  margin-bottom: 0.75rem;
}
`)

let users = [
  { id: 1, nickname: 'alice' },
  { id: 2, nickname: 'bob' },
  { id: 3, nickname: 'charlie' },
]

let Nickname = newSingleFieldForm({
  action: '/name-list/update',
  label: 'Nickname',
  name: 'nickname',
  updateKeyName: 'id',
  updateValue(attrs, context) {
    const { id, nickname } = attrs.input
    const index = +id - 1
    users[index].nickname = nickname
  },
  renderUpdate(attrs, context) {
    return content
  },
})

let content = (
  <div id="name-list">
    {style}
    <h1>List Editing Demo</h1>
    <p>This page demo how to use multiple instances of SingleFieldForm.</p>
    <p>Each instance can be distinguished by the "key" attribute.</p>
    <p>
      Example attribute value are index of array and primary key of database
      record.
    </p>
    <p>Below are 3 instances of Nickname.Form mapped over an array of users.</p>
    <View />
    <SourceCode page="name-list.tsx" />
  </div>
)

function View() {
  return mapArray(users, user => (
    <fieldset>
      <legend>user {user.id}</legend>
      <Nickname.Form key={user.id} value={user.nickname} />
    </fieldset>
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
