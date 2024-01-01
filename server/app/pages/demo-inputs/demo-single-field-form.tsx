import { color, id, object } from 'cast.ts'
import code from '../../components/inline-code.js'
import { newSingleFieldForm } from '../../components/single-field-form.js'
import SourceCode from '../../components/source-code.js'
import { CodeBlock } from '../../components/code-block.js'
import Style from '../../components/style.js'
import { o } from '../../jsx/jsx.js'
import { Routes } from '../../routes.js'
import { Link } from '../../components/router.js'

let style = Style(/* css */ `
#fruit_card {
	padding: 0.5rem;
	border-radius: 0.5rem;
}
`)

let fruits = ['apple', 'banana', 'cherry'].map((text, index) => ({
  value: index + 1,
  text,
}))

let user = {
  username: 'alice',
  favorite_fruit_id: 3,
  favorite_color: '#c0ffee',
}

let Username = newSingleFieldForm({
  action: '/inputs/single-field-form/update-username',
  label: 'Username',
  name: 'username',
  updateValue(attrs, context) {
    user.username = attrs.input.username
    if (context.type === 'ws') {
      context.ws.send(['update-text', '#greet_name', attrs.input.username])
    }
  },
  renderUpdate(attrs, context) {
    return content
  },
})

let FavoriteFruit = newSingleFieldForm({
  action: '/inputs/single-field-form/update-fruit',
  label: 'Favorite fruit',
  name: 'fruit',
  onchange: 'submitForm(this.form)',
  submitButton: false,
  updateParser: object({ fruit: id() }),
  updateValue(attrs, context) {
    user.favorite_fruit_id = attrs.input.fruit
    if (context.type === 'ws') {
      context.ws.send([
        'update-text',
        '#fruit_card',
        fruits[user.favorite_fruit_id - 1]?.text,
      ])
    }
  },
  renderUpdate(attrs, context) {
    return content
  },
})

let FavoriteColor = newSingleFieldForm({
  action: '/inputs/single-field-form/update-color',
  label: 'Favorite color',
  name: 'color',
  oninput: 'submitForm(this.form)',
  submitButton: false,
  updateParser: object({ color: color() }),
  updateValue(attrs, context) {
    user.favorite_color = attrs.input.color
    if (context.type === 'ws') {
      context.ws.send([
        'update-props',
        '#fruit_card',
        { style: getTextStyle(attrs.input.color) },
      ])
    }
  },
  renderUpdate(attrs, context) {
    return content
  },
})

function getTextStyle(color: string) {
  let bg = inverseColor(color)
  return `color:${color};background-color:${bg}`
}

function inverseColor(color: string) {
  return (
    '#' +
    toColorPart(color.slice(1, 3)) +
    toColorPart(color.slice(3, 5)) +
    toColorPart(color.slice(5, 7))
  )
}
function toColorPart(hex: string): string {
  let code = parseInt(hex, 16)
  return ((code + 127) % 256).toString(16).padStart(2, '0')
}

let content = (
  <>
    {style}

    <p>
      {code('newSingleFieldForm()')} is a creation function. It helps you build
      simple form with per-field saving mechanism.
    </p>

    <div class="code-demo">
      <fieldset>
        <legend>Example Source Code</legend>
        <CodeBlock
          style="padding: 0.5rem"
          code={`
let Username = newSingleFieldForm({
  action: '/profile/update-username',
  label: 'Username',
  name: 'username',
  updateValue(attrs, context) {
    user.username = attrs.input.username
    if (context.type === 'ws') {
      context.ws.send([
        'update-text',
        '#greet_name',
        attrs.input.username
      ])
    }
  },
  renderUpdate(attrs, context) {
    return content
  },
})

let FavoriteFruit = newSingleFieldForm({
  action: '/profile/update-fruit',
  label: 'Favorite fruit',
  name: 'fruit',
  onchange: 'submitForm(this.form)',
  submitButton: false,
  updateParser: object({ fruit: id() }),
  updateValue(attrs, context) {
    user.favorite_fruit_id = attrs.input.fruit
    if (context.type === 'ws') {
      context.ws.send([
        'update-text',
        '#fruit_card',
        fruits[user.favorite_fruit_id - 1]?.text,
      ])
    }
  },
  renderUpdate(attrs, context) {
    return content
  },
})

function Profile() {
  return (
    <>
      <p>
        Welcome back,
        <span id="greet_name">{user.username}</span>.
      </p>
      <Username.Form value={user.username} />
      <FavoriteFruit.Form
        value={{
          options: fruits,
          selected: user.favorite_fruit_id,
        }}
      />
      <span id="fruit_card">
        {fruits[user.favorite_fruit_id - 1]?.text}
      </span>
    </>
  )
}

let routes: Routes = {
  '/profile': {
    title: title('Profile Page'),
    description: 'View and update your public profile',
    node: <Profile/>
  },
  ...Username.routes,
  ...FavoriteFruit.routes,
}

export default { routes, content }
`.trim()}
        ></CodeBlock>
      </fieldset>
      <fieldset>
        <legend>Preview</legend>
        <UserProfile />
      </fieldset>
    </div>

    <p>
      The update message id is auto incremented to avoid duplication among
      different fields created by {code('newSingleFieldForm()')}. However, if
      the {code('<field.Form/>')} is used multiple times on screen, e.g. in{' '}
      {code('mapArray')} loop, you should supply {code('updateMessageKeyName')}{' '}
      attribute to {code('newSingleFieldForm()')} and {code('key')} attribute to{' '}
      {code('<field.Form/>')}. Example see{' '}
      <Link href="/name-list">List Editing Demo</Link>
    </p>

    <p>
      The possibility is endless. You can extend or modify the page and
      components to suit your need.
    </p>

    <SourceCode page="demo-inputs/demo-single-field-form.tsx" />
  </>
)

function UserProfile() {
  return (
    <>
      <p>
        Welcome back, <span id="greet_name">{user.username}</span>
      </p>
      <Username.Form value={user.username} />
      <FavoriteFruit.Form
        value={{
          options: fruits,
          selected: user.favorite_fruit_id,
        }}
      />
      <FavoriteColor.Form value={user.favorite_color} type="color" />
      <span id="fruit_card" style={getTextStyle(user.favorite_color)}>
        {fruits[user.favorite_fruit_id - 1]?.text}
      </span>
    </>
  )
}

let routes: Routes = {
  ...Username.routes,
  ...FavoriteFruit.routes,
  ...FavoriteColor.routes,
}

export default { routes, content }
