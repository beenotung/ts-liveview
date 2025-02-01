import { DynamicContext } from '../context.js'
import { o } from '../jsx/jsx.js'
import { mapArray } from './fragment.js'
import { Link } from './router.js'
import Style from './style.js'

export let PaginationStyle = Style(/* css */ `
.pagination {
  display: inline-flex;
  gap: 0.25em;
  flex-wrap: wrap;
  align-items: center;
  font-size: 1rem;
}
.pagination--link {
  display: inline-block;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
}
.pagination--link.current {
  font-weight: bold;
}
.pagination--ellipsis {
  display: inline-block;
  padding: 0.25rem 0.25rem;
}
`)

let ellipsis = <span class="pagination--ellipsis">...</span>

export function Pagination(
  attrs: {
    'style'?: string
    'class'?: string
    'base-url'?: string
  } & (
    | {
        'current-page': number
        'max-page': number
      }
    | {
        offset: number
        limit: number
        total: number
      }
  ),
  context: DynamicContext,
) {
  let base_url = attrs['base-url'] ?? context.url
  let parts = base_url.split('?')
  let pathname = parts[0]
  let params = new URLSearchParams(parts[1])

  let min_page = 1
  let max_page =
    'max-page' in attrs
      ? attrs['max-page']
      : Math.ceil(attrs['total'] / attrs['limit'])
  let current =
    'current-page' in attrs
      ? attrs['current-page']
      : Math.floor(attrs.offset / attrs['limit']) + 1

  let className = 'pagination'
  if (attrs.class) {
    className += ' ' + attrs.class
  }

  let pages: number[] = []

  // first page
  pages.push(min_page)

  // current page and surrounding pages
  let wrap = 2
  let from = Math.max(min_page + 1, current - wrap)
  let to = Math.min(current + wrap, max_page)

  // surrounding pages
  for (let page = from; page <= to; page++) {
    if (page > pages[pages.length - 1]) {
      if (page != pages[pages.length - 1] + 1) {
        pages.push(ellipsis)
      }
      pages.push(page)
    }
  }

  // last page
  if (max_page > pages[pages.length - 1]) {
    if (max_page != pages[pages.length - 1] + 1) {
      pages.push(ellipsis)
    }

    pages.push(max_page)
  }

  return (
    <>
      {PaginationStyle}
      <div class={className} style={attrs.style}>
        {mapArray(pages, (page, index, pages) => {
          if (typeof page !== 'number') {
            return page
          }
          params.set('page', page.toString())

          let className = 'pagination--link'
          if (page == current) {
            className += ' current'
          }
          return (
            <Link class={className} href={`${pathname}?${params}`}>
              {page}
            </Link>
          )
        })}
      </div>
    </>
  )
}

export default Pagination
