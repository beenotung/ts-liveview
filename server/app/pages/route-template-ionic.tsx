import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle } from '../../config.js'
import Style from '../components/style.js'
import {
  Context,
  DynamicContext,
  getContextFormBody,
  throwIfInAPI,
} from '../context.js'
import { mapArray } from '../components/fragment.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { Locale, Title } from '../components/locale.js'
import { proxy } from '../../../db/proxy.js'
import { env } from '../../env.js'
import { Script } from '../components/script.js'
import { toSlug } from '../format/slug.js'
import { IonButton } from '../components/ion-button.js'
import { BackToLink } from '../components/back-to-link.js'

let pageTitle = <Locale en="__title__" zh_hk="__title__" zh_cn="__title__" />
let addPageTitle = (
  <Locale en="Add __title__" zh_hk="添加__title__" zh_cn="添加__title__" />
)

let style = Style(/* css */ `
#__id__ {

}
`)

let script = Script(/* js */ `
`)

let page = (
  <>
    {style}
    <ion-header>
      <ion-toolbar>
        <IonBackButton href="/" />
        <ion-title role="heading" aria-level="1">
          {pageTitle}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="__id__" class="ion-padding">
      Items
      <Main />
    </ion-content>
    {script}
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
    <>
      <ion-list>
        {mapArray(items, item => (
          <ion-item>
            {item.title} ({item.slug})
          </ion-item>
        ))}
      </ion-list>
      <IonButton url="/__url__/add">{addPageTitle}</IonButton>
    </>
  )
}

let addPageStyle = Style(/* css */ `
#Add__id__ .hint {
  margin-inline-start: 1rem;
  margin-block: 0.25rem;
}
`)
let addPageScript = Script(/* js */ `
${toSlug}
function updateSlugPreview() {
  if (!addForm.slug) return
  let value = addForm.slug.value || addForm.slug.placeholder
  previewSlug.textContent = toSlug(value)
}
updateSlugPreview()
`)
let addPage = (
  <>
    {addPageStyle}
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
              label={
                <Locale en="Slug*:" zh_hk="短網址碼*:" zh_cn="短网址码*:" />
              }
              label-placement="floating"
              required
              pattern="(\w|-|\.){1,32}"
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
              zh_hk="網址的一部分，例如： "
              zh_cn="网址的一部分，例如： "
            />
            <br />
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
          <Locale
            en="* mandatory fields"
            zh_hk="* 必填欄位"
            zh_cn="* 必填字段"
          />
        </p>
        <p id="add-message"></p>
      </form>
    </ion-content>
    {addPageScript}
  </>
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
    <>
      <ion-header>
        <ion-toolbar>
          <IonBackButton href="/__url__/add" backText="Form" />
          <ion-title role="heading" aria-level="1">
            <Locale en="Submitted" zh_hk="已提交" zh_cn="已提交" />
            {pageTitle}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id="Add__id__" class="ion-padding">
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
      </ion-content>
    </>
  )
}

let routes = {
  '/__url__': {
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
