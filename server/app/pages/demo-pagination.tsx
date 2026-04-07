import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import Style from '../components/style.js'
import { Context, DynamicContext } from '../context.js'
import { Locale, Title } from '../components/locale.js'
import Script from '../components/script.js'
import { allNames } from '@beenotung/tslib/constant/character-name.js'
import { allFruits } from '@beenotung/tslib/constant/fruit-name.js'
import Pagination from '../components/pagination.js'
import { mapArray } from '../components/fragment.js'
import { clamp } from '../../utils/range.js'
import { Select } from '../components/select.js'

let pageTitle = (
  <Locale en="Pagination Demo" zh_hk="分頁示例" zh_cn="分页示例" />
)

let style = Style(/* css */ `
#DemoPagination .pagination .current {
  background-color: #cceeff;
}
#DemoPagination .field {
  margin: 0.25rem 0;
}
`)

let script = Script(/* js */ `
function selectItemsPerPage(event) {
  let params = new URLSearchParams(location.search)
  let oldCount = params.get('count') || 10
  let oldPage = params.get('page') || 1
  let newCount = event.target.value
  let offset = (oldPage - 1) * oldCount
  let newPage = Math.floor(offset / newCount) + 1
  params.set('count', newCount)
  params.set('page', newPage)
  let url = location.pathname + '?' + params
  goto(url)
}
`)

// replace this array with proxy for database-backed persistence
// e.g. let items = proxy.demo_pagination
let items = allNames
  .flatMap(name => allFruits.map(fruit => ({ name, fruit })))
  .map((item, index) => ({ id: index + 1, ...item }))
let total = items.length

function ListPage(attrs: {}, context: DynamicContext) {
  let params = new URLSearchParams(context.routerMatch?.search)
  let itemsPerPage = clamp({
    min: 3,
    max: 200,
    value: params.get('count'),
    default: 10,
  })
  let maxPage = Math.ceil(total / itemsPerPage)
  let currentPage = clamp({
    min: 1,
    max: maxPage,
    value: params.get('page'),
    default: 1,
  })
  let offset = (currentPage - 1) * itemsPerPage
  let displayItems = items.slice(offset, offset + itemsPerPage)
  return (
    <>
      {style}
      <div id="DemoPagination">
        <h1>{pageTitle}</h1>
        <p>{total} sample items.</p>
        <ol>
          {mapArray(displayItems, item => (
            <li value={item.id}>
              {item.name}'s {item.fruit}
            </li>
          ))}
        </ol>
        <Pagination current-page={currentPage} max-page={maxPage} />
        <div class="field">
          <label>
            Items per page{' '}
            <Select
              options={[3, 5, 10, 25, 50, 100, 200]}
              onchange="selectItemsPerPage(event)"
              value={itemsPerPage}
            />
          </label>
        </div>
      </div>
      {script}
    </>
  )
}

let routes = {
  '/demo-pagination': {
    menuText: <Locale en="Pagination" zh_hk="分頁" zh_cn="分页" />,
    title: <Title t={pageTitle} />,
    description: 'TODO',
    node: <ListPage />,
  },
} satisfies Routes

export default { routes }
