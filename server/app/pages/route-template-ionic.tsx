import { o } from '../jsx/jsx.js'
import type { ServerMessage } from '../../../client/types'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import {
  Context,
  DynamicContext,
  getContextFormBody,
  throwIfInAPI,
  WsContext,
} from '../context.js'
import { mapArray } from '../components/fragment.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError, showError } from '../components/error.js'
import { EarlyTerminate, MessageException } from '../../exception.js'
import { Locale, Title } from '../components/locale.js'
import { proxy } from '../../../db/proxy.js'
import { env } from '../../env.js'
import { Script } from '../components/script.js'
import { toSlug } from '../format/slug.js'
import { IonButton } from '../components/ion-button.js'
import { BackToLink } from '../components/back-to-link.js'
import { sweetAlertPlugin } from '../../client-plugins.js'

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

// replace this array with proxy for database-backed persistence
// e.g. let items = proxy.__table__
let items = [
  { title: 'Android', slug: 'md' },
  { title: 'iOS', slug: 'ios' },
]

function ListPage(attrs: {}, context: Context) {
  return (
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
        <ion-list>
          {mapArray(items, item => (
            <ion-item>
              <Link href={`/__url__/${item.slug}`}>
                {item.title} ({item.slug})
              </Link>
            </ion-item>
          ))}
        </ion-list>
        <IonButton url="/__url__/add">{addPageTitle}</IonButton>
      </ion-content>
      {script}
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
              {env.ORIGIN}/__url__/<i id="previewSlug">alice-in-wonderland</i>
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

let detailPageStyle = Style(/* css */ `
#Detail__id__ .field[data-field="title"] ion-input { min-width: 12.5rem; }
`)

let detailPageScript = Script(/* js */ `
function setEditMode(event, mode) {
  let field = event.target.closest('.field')
  let input = field.querySelector('ion-input')
  if (!input) return

  if (mode === 'edit') {
    // Entering edit mode - make input editable
    input.readonly = false
    input.setFocus()
  } else if (mode === 'view') {
    input.readonly = true
  }

  field.dataset.mode = mode
}
function saveField(button) {
  let field = button.closest('.field')
  let ionInput = field.querySelector('ion-input')
  if (!ionInput) return

  // Get the native input element inside ion-input
  let nativeInput = ionInput.querySelector('input')
  if (!nativeInput) return

  if (!nativeInput.checkValidity()) {
    nativeInput.reportValidity()
    return
  }
  let value = ionInput.value
  emit(button.dataset.url, value)
}
function handleFieldKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    let field = event.target.closest('.field')
    let button = field.querySelector('.edit-mode ion-button:first-child')
    if (button) button.click()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    setEditMode(event, 'view')
  }
}
`)

function DetailPage(
  attrs: { item: (typeof items)[0] },
  context: DynamicContext,
) {
  let { item } = attrs
  return (
    <>
      {detailPageStyle}
      <ion-header>
        <ion-toolbar>
          <IonBackButton href="/__url__" backText={pageTitle} />
          <ion-title role="heading" aria-level="1">
            {item.title}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id="Detail__id__" class="ion-padding">
        <ion-list>
          <ion-item
            class="field inline-edit-field"
            data-field="title"
            data-mode="view"
          >
            <ion-input
              label-placement="floating"
              label={<Locale en="Title" zh_hk="標題" zh_cn="標題" />}
              value={item.title}
              readonly
              required
              minlength="3"
              maxlength="50"
              onkeydown="handleFieldKeydown(event)"
            ></ion-input>
            <ion-buttons slot="end">
              <ion-button
                onclick="setEditMode(event, 'edit')"
                class="view-mode"
                fill="solid"
              >
                <Locale en="Edit" zh_hk="編輯" zh_cn="编辑" />
              </ion-button>
              <span class="edit-mode">
                <ion-button
                  data-url={`/__url__/${item.slug}/update/title`}
                  onclick="saveField(this)"
                  fill="solid"
                  color="primary"
                >
                  <Locale en="Save" zh_hk="保存" zh_cn="保存" />
                </ion-button>
                <ion-button
                  onclick="setEditMode(event, 'view')"
                  fill="solid"
                  color="dark"
                >
                  <Locale en="Cancel" zh_hk="取消" zh_cn="取消" />
                </ion-button>
              </span>
            </ion-buttons>
          </ion-item>
          <ion-item>
            <ion-input
              label-placement="floating"
              label={<Locale en="Slug" zh_hk="短網址碼" zh_cn="短网址码" />}
              value={item.slug}
              readonly
            ></ion-input>
          </ion-item>
        </ion-list>
      </ion-content>
      {sweetAlertPlugin.node}
      {detailPageScript}
    </>
  )
}

function UpdateField(attrs: {}, context: WsContext) {
  if (context.type !== 'ws') {
    throw new Error('This endpoint only supports WebSocket')
  }
  try {
    let slug = context.routerMatch?.params.slug
    let field = context.routerMatch?.params.field
    let value = context.args?.[0] as string

    if (!field) throw `Missing field name`
    if (!value) throw `Missing value`

    let itemIndex = items.findIndex(item => item.slug === slug)
    if (itemIndex === -1) throw `Item not found: ${slug}`

    let container = `#Detail__id__`
    function commitField(extra?: ServerMessage[]) {
      let messages: ServerMessage[] = [
        [
          'set-value',
          `${container} .field[data-field="${field}"] ion-input`,
          value,
        ],
        [
          'update-attrs',
          `${container} .field[data-field="${field}"]`,
          { 'data-mode': 'view' },
        ],
        [
          'update-attrs',
          `${container} .field[data-field="${field}"] ion-input`,
          { readonly: 'true' },
        ],
      ]
      if (extra) {
        messages.push(...extra)
      }
      context.ws.send(['batch', messages])
    }

    switch (field) {
      case 'title':
        if (value == slug) {
          throw `demo validation error: slug cannot be the same as title`
        }
        items[itemIndex].title = value
        commitField([
          /* special case also update the page title */
          ['update-text', 'ion-title', value],
          ['set-title', 'Details of ' + value],
        ])
        throw EarlyTerminate
      default:
        throw `Unknown field: ${field}`
    }
  } catch (error) {
    if (error instanceof MessageException) {
      context.ws.send(error.message)
    } else if (error != EarlyTerminate) {
      context.ws.send(showError(error))
    }
    throw EarlyTerminate
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
    node: <ListPage />,
  },
  '/__url__/:slug': {
    resolve(context) {
      let slug = context.routerMatch?.params.slug
      let item = items.find(item => item.slug === slug)
      if (!item) {
        return {
          title: apiEndpointTitle,
          description: '__title__ item not found',
          node: renderError('__title__ item not found, slug: ' + slug, context),
        }
      }
      return {
        title: title('Details of ' + item.title),
        description: 'Details of ' + item.title,
        node: DetailPage({ item }, context),
      }
    },
  },
  '/__url__/:slug/update/:field': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <UpdateField />,
    streaming: false,
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
