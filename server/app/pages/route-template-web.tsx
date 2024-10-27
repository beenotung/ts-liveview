import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import { Context, DynamicContext, getContextFormBody } from '../context.js'
import { mapArray } from '../components/fragment.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { ServerMessage } from '../../../client/types.js'
import { EarlyTerminate, MessageException } from '../helpers.js'

let pageTitle = '__title__'
let addPageTitle = 'Add __title__'

let style = Style(/* css */ `
#__id__ {

}
`)

let page = (
  <>
    {style}
    <div id="__id__">
      <h1>{pageTitle}</h1>
      <Main />
    </div>
  </>
)

let items = [
  { title: 'Android', slug: 'md' },
  { title: 'iOS', slug: 'ios' },
]

function Main(attrs: {}, context: Context) {
  return (
    <>
      <ul>
        {mapArray(items, item => (
          <li>
            {item.title} ({item.slug})
          </li>
        ))}
      </ul>
      <Link href="/__url__/add">
        <button>{addPageTitle}</button>
      </Link>
    </>
  )
}

let addPage = (
  <div id="Add__id__">
    {Style(/* css */ `
#Add__id__ .field {
  margin-block-end: 1rem;
}
#Add__id__ .field label input {
  display: block;
  margin-block-start: 0.25rem;
}
#Add__id__ .field label .hint {
  display: block;
  margin-block-start: 0.25rem;
}
`)}
    <h1>{addPageTitle}</h1>
    <form method="POST" action="/__url__/add/submit" onsubmit="emitForm(event)">
      <div class="field">
        <label>
          Title*:
          <input name="title" required minlength="3" maxlength="50" />
          <p class="hint">(3-50 characters)</p>
        </label>
      </div>
      <div class="field">
        <label>
          Slug*:
          <input
            name="slug"
            required
            placeholder="should be unique"
            pattern="(\w|-|\.){1,32}"
          />
          <p class="hint">
            (1-32 characters of: <code>a-z A-Z 0-9 - _ .</code>)
          </p>
        </label>
      </div>
      <input type="submit" value="Submit" />
      <p>
        Remark:
        <br />
        *: mandatory fields
      </p>
      <p id="add-message"></p>
    </form>
  </div>
)

let submitParser = object({
  title: string({ minLength: 3, maxLength: 50 }),
  slug: string({ match: /^[\w-]{1,32}$/ }),
})

function Submit(attrs: {}, context: DynamicContext) {
  try {
    let body = getContextFormBody(context)
    let input = submitParser.parse(body)
    let id = items.push({
      title: input.title,
      slug: input.slug,
    })
    return <Redirect href={`/__url__/result?id=${id}`} />
  } catch (error) {
    let message: ServerMessage =
      error instanceof MessageException
        ? error.message
        : [
            'batch',
            [
              ['update-text', '#add-message', String(error)],
              ['add-class', '#add-message', 'error'],
            ],
          ]
    if (context.type == 'ws') {
      context.ws.send(message)
      throw EarlyTerminate
    }
    if (context.type == 'express') {
      context.res.json({ message })
      throw EarlyTerminate
    }
    return (
      <Redirect
        href={
          '/__url__/result?' + new URLSearchParams({ error: String(error) })
        }
      />
    )
  }
}

function SubmitResult(attrs: {}, context: DynamicContext) {
  let params = new URLSearchParams(context.routerMatch?.search)
  let error = params.get('error')
  let id = params.get('id')
  return (
    <div>
      {error ? (
        renderError(error, context)
      ) : (
        <>
          <p>Your submission is received (#{id}).</p>
          <p>
            Back to <Link href="/__url__">{pageTitle}</Link>
          </p>
        </>
      )}
    </div>
  )
}

let routes = {
  '/__url__': {
    title: title(pageTitle),
    description: 'TODO',
    menuText: pageTitle,
    node: page,
  },
  '/__url__/add': {
    title: title(addPageTitle),
    description: 'TODO',
    node: addPage,
    streaming: false,
  },
  '/__url__/add/submit': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <Submit />,
    streaming: false,
  },
  '/__url__/result': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <SubmitResult />,
    streaming: false,
  },
} satisfies Routes

export default { routes }
