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
import { Locale, Title } from '../components/locale.js'
import { env } from '../../env.js'
import { Script } from '../components/script.js'
import { toSlug } from '../format/slug.js'

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

// replace this array with proxy for database-backed persistence
// e.g. let items = proxy.__table__
let items = [
  { title: 'Android', slug: 'md' },
  { title: 'iOS', slug: 'ios' },
]

function Main(attrs: {}, context: Context) {
  return (
    <Content
      web={
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
      }
      ionic={
        <>
          <ion-list>
            {mapArray(items, item => (
              <ion-item>
                {item.title} ({item.slug})
              </ion-item>
            ))}
          </ion-list>
          <Link href="/__url__/add" tagName="ion-button">
            {addPageTitle}
          </Link>
        </>
      }
    />
  )
}

let addPageScript = Script(/* js */ `
${toSlug}
function updateSlugPreview() {
  if (!addForm.slug) return
  let value = addForm.slug.value || addForm.slug.placeholder
  previewSlug.textContent = toSlug(value)
}
updateSlugPreview()
`)
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
        <Locale en="Title" zh_hk="標題" zh_cn="標題" />
        *:
        <input name="title" required minlength="3" maxlength="50" />
        <p class="hint">
          <Locale
            en="(3 to 50 characters)"
            zh_hk="(3 至 50 個字元)"
            zh_cn="(3 至 50 个字元)"
          />
        </p>
      </label>
    </div>
    <div class="field">
      <label>
        <Locale en="Short URL Code" zh_hk="短網址碼" zh_cn="短网址码" />
        *:
        <input
          name="slug"
          required
          placeholder="e.g. alice-in-wonderland"
          pattern="(\w|-|\.){1,32}"
          oninput="updateSlugPreview()"
        />
        <p class="hint">
          (
          <Locale
            en="1 to 32 characters of: "
            zh_hk="1 至 32 個字元："
            zh_cn="1 至 32 个字元："
          />
          <code>a-z 0-9 - _ .</code>)
          <br />
          <Locale
            en="A unique part of the URL, e.g. "
            zh_hk="網址的一部分，例如："
            zh_cn="网址的一部分，例如："
          />
          <code>
            {env.ORIGIN}/<i id="previewSlug">alice-in-wonderland</i>
          </code>
        </p>
      </label>
    </div>
    <input
      type="submit"
      value={<Locale en="Submit" zh_hk="提交" zh_cn="提交" />}
    />
    <p>
      <Locale en="Remark:" zh_hk="備註：" zh_cn="备注：" />
      <br />
      <Locale en="* mandatory fields" zh_hk="* 必填欄位" zh_cn="* 必填字段" />
    </p>
    <p id="add-message"></p>
    {addPageScript}
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
          label={<Locale en="Title*:" zh_hk="標題*:" zh_cn="標題*:" />}
          label-placement="floating"
          required
          minlength="3"
          maxlength="50"
        />
      </ion-item>
      <p class="hint">
        <Locale
          en="(3 to 50 characters)"
          zh_hk="(3 至 50 個字元)"
          zh_cn="(3 至 50 个字元)"
        />
      </p>
      <ion-item>
        <ion-input
          name="slug"
          label={<Locale en="Slug*:" zh_hk="短網址碼*:" zh_cn="短网址码*:" />}
          label-placement="floating"
          required
          pattern="(\w|-|\.){1,32}"
          oninput="updateSlugPreview()"
          placeholder="e.g. alice-in-wonderland"
        />
      </ion-item>
      <p class="hint">
        (
        <Locale
          en="1 to 32 characters of: "
          zh_hk="1 至 32 個字元："
          zh_cn="1 至 32 个字元："
        />
        <code>a-z 0-9 - _ .</code>)
        <br />
        <Locale
          en="A unique part of the URL, e.g. "
          zh_hk="網址的一部分，例如："
          zh_cn="网址的一部分，例如："
        />
        <code
          style="
            display: inline-block;
            background-color: #eee;
            padding: 0.25rem 0.5rem;
            border-radius: 0.5rem;
            border: 1px solid #ccc;
            margin-top: 0.25rem;
          "
        >
          {env.ORIGIN}/<i id="previewSlug">alice-in-wonderland</i>
        </code>
      </p>
    </ion-list>
    <div style="margin-inline-start: 1rem">
      <ion-button type="submit">
        <Locale en="Submit" zh_hk="提交" zh_cn="提交" />
      </ion-button>
    </div>
    <p>
      <Locale en="Remark:" zh_hk="備註：" zh_cn="备注：" />
      <br />
      <Locale en="* mandatory fields" zh_hk="* 必填欄位" zh_cn="* 必填字段" />
    </p>
    <p id="add-message"></p>
    {addPageScript}
  </>
)
let addPage = (
  <Page
    id="Add__id__"
    title={addPageTitle}
    backHref="/__url__"
    backText={pageTitle}
  >
    <form
      id="addForm"
      method="POST"
      action="/__url__/add/submit"
      onsubmit="emitForm(event)"
    >
      <Content web={addPage_web} ionic={addPage_ionic} />
    </form>
  </Page>
)

let submitParser = object({
  title: string({ minLength: 3, maxLength: 50 }),
  slug: string({ match: /^[\w\-.]{1,32}$/, case: 'lower' }),
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
          <p>
            <Locale
              en={`Your submission is received (#${id}).`}
              zh_hk={`你的提交已收到 (#${id})。`}
              zh_cn={`你的提交已收到 (#${id})。`}
            />
          </p>
          <BackToLink href="/__url__" title={pageTitle} />
        </>
      )}
    </Page>
  )
}

let routes = {
  '/__url__': {
    menuText: pageTitle,
    title: <Title t={pageTitle} />,
    description: 'TODO',
    node: page,
  },
  '/__url__/add': {
    title: <Title t={addPageTitle} />,
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
