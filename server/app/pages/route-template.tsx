import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import { Context, DynamicContext, getContextFormBody } from '../context.js'
import { mapArray } from '../components/fragment.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { LayoutType, config } from '../../config.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'

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
if (config.layout_type === LayoutType.ionic) {
  page = (
    <>
      {style}
      <ion-header>
        <ion-toolbar>
          <IonBackButton href="/" backText="Home" />
          <ion-title role="heading" aria-level="1">
            {pageTitle}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id="__id__" class="ion-padding">
        Items
        <Main />
      </ion-content>
    </>
  )
}

let items = [
  { title: 'Android', slug: 'md' },
  { title: 'iOS', slug: 'ios' },
]

function Main(attrs: {}, context: Context) {
  if (config.layout_type !== LayoutType.ionic) {
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
          <button>Add Item</button>
        </Link>
      </>
    )
  }
  return (
    <>
      <ion-list>
        {mapArray(items, item => (
          <ion-item>
            {item.title} ({item.slug})
          </ion-item>
        ))}
      </ion-list>
      <Link href="/__url__/add" tagName="ion-button">
        Add Item
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
    </form>
  </div>
)
if (config.layout_type === LayoutType.ionic) {
  addPage = (
    <>
      {Style(/* css */ `
#Add__id__ .hint {
  margin-inline-start: 1rem;
  margin-block: 0.25rem;
}
`)}
      <ion-header>
        <ion-toolbar>
          <IonBackButton href="/__url__" backText={pageTitle} />
          <ion-title role="heading" aria-level="1">
            {addPageTitle}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id="Add__id__" class="ion-padding">
        <form
          method="POST"
          action="/__url__/add/submit"
          onsubmit="emitForm(event)"
        >
          <ion-list>
            <ion-item>
              <ion-input
                name="title"
                label="Title*:"
                label-placement="floating"
                required
                minlength="3"
                maxlength="50"
              />
            </ion-item>
            <p class="hint">(3-50 characters)</p>
            <ion-item>
              <ion-input
                name="slug"
                label="Slug*: (unique url)"
                label-placement="floating"
                required
                pattern="(\w|-|\.){1,32}"
              />
            </ion-item>
            <p class="hint">
              (1-32 characters of: <code>a-z A-Z 0-9 - _ .</code>)
            </p>
          </ion-list>
          <div style="margin-inline-start: 1rem">
            <ion-button type="submit">Submit</ion-button>
          </div>
          <p>
            Remark:
            <br />
            *: mandatory fields
          </p>
        </form>
      </ion-content>
    </>
  )
}

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
  if (config.layout_type !== LayoutType.ionic) {
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
  return (
    <>
      <ion-header>
        <ion-toolbar>
          <IonBackButton href="/__url__/add" backText="Form" />
          <ion-title role="heading" aria-level="1">
            Submitted {pageTitle}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id="Add__id__" class="ion-padding">
        {error ? (
          renderError(error, context)
        ) : (
          <>
            <p>Your submission is received (#{id}).</p>
            <Link href="/__url__" tagName="ion-button">
              Back to {pageTitle}
            </Link>
          </>
        )}
      </ion-content>
    </>
  )
}

let routes: Routes = {
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
}

export default { routes }
