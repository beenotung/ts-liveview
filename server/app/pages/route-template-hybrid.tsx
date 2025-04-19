import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import {
  Context,
  DynamicContext,
  getContextFormBody,
  throwIfInAPI,
} from '../context.js'
import { mapArray } from '../components/fragment.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { Content, Page } from '../components/page.js'
import { BackToLink } from '../components/back-to-link.js'
import { getAuthUser } from '../auth/user.js'
import { evalLocale, Locale } from '../components/locale.js'
import { Button } from '../components/button.js'
import { IonButton } from '../components/ion-button.js'

let pageTitle = <Locale en="__title__" zh_hk="__title__" zh_cn="__title__" />
let addPageTitle = (
  <Locale en="Add __title__" zh_hk="添加__title__" zh_cn="添加__title__" />
)

let style = Style(/* css */ `
#__id__ {

}
`)

let page = (
  <>
    {style}
    <Page id="__id__" title={pageTitle} backHref="/" backText="Home">
      <Content ionic="Items" />
      <Main />
    </Page>
  </>
)

let items = [
  { title: 'Android', slug: 'md' },
  { title: 'iOS', slug: 'ios' },
]

function Main(attrs: {}, context: Context) {
  let user = getAuthUser(context)
  return (
    <>
      <Content
        web={
          <ul>
            {mapArray(items, item => (
              <li>
                {item.title} ({item.slug})
              </li>
            ))}
          </ul>
        }
        ionic={
          <ion-list>
            {mapArray(items, item => (
              <ion-item>
                {item.title} ({item.slug})
              </ion-item>
            ))}
          </ion-list>
        }
      />
      {user ? (
        <Content
          web={<Button url="/__url__/add">{addPageTitle}</Button>}
          ionic={<IonButton url="/__url__/add">{addPageTitle}</IonButton>}
        />
      ) : (
        <p>
          You can add __name__ after <Link href="/register">register</Link>.
        </p>
      )}
    </>
  )
}

let addPage_web = (
  <>
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
  </>
)
let addPage_ionic = (
  <>
    {Style(/* css */ `
#Add__id__ .hint {
  margin-inline-start: 1rem;
  margin-block: 0.25rem;
}
`)}
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
    <p id="add-message"></p>
  </>
)
let addPage = (
  <Page
    id="Add__id__"
    title={addPageTitle}
    backHref="/__url__"
    backText={pageTitle}
  >
    <form method="POST" action="/__url__/add/submit" onsubmit="emitForm(event)">
      <Content web={addPage_web} ionic={addPage_ionic} />
    </form>
  </Page>
)
function AddPage(attrs: {}, context: DynamicContext) {
  let user = getAuthUser(context)
  if (!user) return <Redirect href="/login" />
  return addPage
}

let submitParser = object({
  title: string({ minLength: 3, maxLength: 50 }),
  slug: string({ match: /^[\w-]{1,32}$/ }),
})

function Submit(attrs: {}, context: DynamicContext) {
  try {
    let user = getAuthUser(context)
    if (!user) throw 'You must be logged in to submit ' + pageTitle
    let body = getContextFormBody(context)
    let input = submitParser.parse(body)
    let id = items.push({
      title: input.title,
      slug: input.slug,
    })
    return <Redirect href={`/__url__/result?id=${id}`} />
  } catch (error) {
    throwIfInAPI(error, '#add-message', context)
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
    <Page
      id="Add__id__"
      backHref="/__url__/add"
      backText="Form"
      title={'Submitted ' + pageTitle}
    >
      {error ? (
        renderError(error, context)
      ) : (
        <>
          <p>Your submission is received (#{id}).</p>
          <BackToLink href="/__url__" title={pageTitle} />
        </>
      )}
    </Page>
  )
}

let routes = {
  '/__url__': {
    menuText: pageTitle,
    resolve(context) {
      let t = evalLocale(pageTitle, context)
      return {
        title: title(t),
        description: 'TODO',
        node: page,
      }
    },
  },
  '/__url__/add': {
    title: title(addPageTitle),
    description: 'TODO',
    node: <AddPage />,
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
