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
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError, showError } from '../components/error.js'
import { EarlyTerminate, MessageException } from '../../exception.js'
import { Content, Page, is_ionic } from '../components/page.js'
import { BackToLink } from '../components/back-to-link.js'
import { Locale, Title } from '../components/locale.js'
import { env } from '../../env.js'
import Script from '../components/script.js'
import { toSlug } from '../format/slug.js'
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
      <Page id="__id__" title={pageTitle} backHref="/" backText="Home">
        <Content
          web={
            <>
              <ul>
                {mapArray(items, item => (
                  <li>
                    <Link href={`/__url__/${item.slug}`}>
                      {item.title} ({item.slug})
                    </Link>
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
                    <Link href={`/__url__/${item.slug}`}>
                      {item.title} ({item.slug})
                    </Link>
                  </ion-item>
                ))}
              </ion-list>
              <Link href="/__url__/add" tagName="ion-button">
                {addPageTitle}
              </Link>
            </>
          }
        />
      </Page>
      {script}
    </>
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
            {env.ORIGIN}/__url__/<i id="previewSlug">alice-in-wonderland</i>
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
      <Locale en="* mandatory fields" zh_hk="* 必填欄位" zh_cn="* 必填字段" />
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
    <form
      id="addForm"
      method="POST"
      action="/__url__/add/submit"
      onsubmit="emitForm(event)"
    >
      <Content web={addPage_web} ionic={addPage_ionic} />
    </form>
    {addPageScript}
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

let detailPageStyle = Style(/* css */ `
#Detail__id__ input[name="title"] { min-width: 12.5rem; }
#Detail__id__ .field[data-field="title"] ion-input { min-width: 12.5rem; }
`)

let detailPageScript = Script(/* js */ `
function setEditMode(event, mode) {
  let field = event.target.closest('.field')
  let ionInput = field.querySelector('ion-input')
  let input = field.querySelector('input')

  if (ionInput) {
    // Ionic version
    if (mode === 'edit') {
      ionInput.readonly = false
      ionInput.setFocus()
    } else if (mode === 'view') {
      ionInput.readonly = true
    }
  } else if (input) {
    // Web version
    if (mode === 'edit') {
      let value = field.querySelector('.view-mode').textContent.trim()
      input.value = value
    }
  }

  field.dataset.mode = mode
}
function saveField(button) {
  let field = button.closest('.field')
  let ionInput = field.querySelector('ion-input')
  let input = field.querySelector('input')

  if (ionInput) {
    // Ionic version
    let nativeInput = ionInput.querySelector('input')
    if (!nativeInput) return
    if (!nativeInput.checkValidity()) {
      nativeInput.reportValidity()
      return
    }
    emit(button.dataset.url, ionInput.value)
  } else if (input) {
    // Web version
    if (!input.checkValidity()) {
      input.reportValidity()
      return
    }
    emit(button.dataset.url, input.value)
  }
}
function handleFieldKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    let field = event.target.closest('.field')
    let button = field.querySelector('.edit-mode ion-button:first-child') || field.querySelector('.edit-mode button:first-child')
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
      <Page
        id="Detail__id__"
        title={item.title}
        backHref="/__url__"
        backText={pageTitle}
      >
        <Content
          web={
            <>
              <dl>
                <dt>
                  <Locale en="Title" zh_hk="標題" zh_cn="標題" />
                </dt>
                <dd
                  class="field inline-edit-field"
                  data-field="title"
                  data-mode="view"
                >
                  <span class="view-mode">{item.title}</span>
                  <span class="edit-mode">
                    <input
                      name="title"
                      required
                      minlength="3"
                      maxlength="50"
                      onkeydown="handleFieldKeydown(event)"
                    />
                  </span>
                  <button
                    type="button"
                    onclick="setEditMode(event, 'edit')"
                    class="view-mode"
                  >
                    <Locale en="Edit" zh_hk="編輯" zh_cn="编辑" />
                  </button>
                  <span class="edit-mode">
                    <button
                      type="button"
                      data-url={`/__url__/${item.slug}/update/title`}
                      onclick="saveField(this)"
                    >
                      <Locale en="Save" zh_hk="保存" zh_cn="保存" />
                    </button>
                    <button type="button" onclick="setEditMode(event, 'view')">
                      <Locale en="Cancel" zh_hk="取消" zh_cn="取消" />
                    </button>
                  </span>
                </dd>
                <dt>
                  <Locale en="Slug" zh_hk="短網址碼" zh_cn="短网址码" />
                </dt>
                <dd>
                  <code>{item.slug}</code>
                </dd>
              </dl>
              <BackToLink href="/__url__" title={pageTitle} />
            </>
          }
          ionic={
            <>
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
                    label={
                      <Locale en="Slug" zh_hk="短網址碼" zh_cn="短网址码" />
                    }
                    value={item.slug}
                    readonly
                  ></ion-input>
                </ion-item>
              </ion-list>
            </>
          }
        />
      </Page>
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
      let messages: ServerMessage[] = []

      if (is_ionic) {
        // Ionic version
        messages.push(
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
        )
      } else {
        // Web version
        messages.push(
          [
            'update-text',
            `${container} .field[data-field="${field}"] .view-mode`,
            value,
          ],
          [
            'update-attrs',
            `${container} .field[data-field="${field}"]`,
            { 'data-mode': 'view' },
          ],
        )
      }

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
          ['update-text', is_ionic ? 'ion-title' : '#Detail__id__ h1', value],
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
