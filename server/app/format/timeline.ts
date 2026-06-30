import { toLocaleDateTimeString } from '../components/datetime.js'
import { Context } from '../context.js'

/**
 * A structural look at how to balance these elements visually:
 * ```
 * [      --- Today, July 1, 2026 ---      ]  <- Sticky Date Header
 *
 * (Avatar) Alex  12:51 AM
 *          │ Hey, did you see the new API updates?
 *          │ They just dropped the changelog.
 *
 * (Avatar) Taylor 12:53 AM
 *          │ Yeah, looking at it now.
 *          │ Looks promising.
 * ```
 *
 * Messages at the same time are merged into one row by default.
 * Pass `mergeKey` to split rows further, e.g. by author within the same minute.
 */

export type DateGroup<Item extends { timestamp: number }> = {
  date: string
  groups: TimeGroup<Item>[]
}

export type TimeGroup<Item extends { timestamp: number }> = {
  time: string
  key?: string | number
  items: Item[]
}

export type GroupByDateOptions<Item extends { timestamp: number }> = {
  items: Item[]
  /**
   * Split rows that share the same time. When omitted, consecutive items at the
   * same time merge into one row (same default key for every item).
   */
  mergeKey?: (item: Item) => string | number | undefined
}

/** @param items should be sorted by timestamp in ascending order already */
export function groupByDate<Item extends { timestamp: number }>(
  options: GroupByDateOptions<Item>,
  context: Context,
) {
  let { items, mergeKey } = options

  let groups: DateGroup<Item>[] = []
  let dateGroup: DateGroup<Item> | undefined
  let timeGroup: TimeGroup<Item> | undefined
  for (let item of items) {
    let timestamp = item.timestamp
    let date = formatDate(timestamp, context)
    let time = formatTime(timestamp, context)
    let key = mergeKey ? mergeKey(item) : undefined

    if (!dateGroup || dateGroup.date !== date) {
      dateGroup = {
        date,
        groups: [],
      }
      timeGroup = undefined
      groups.push(dateGroup)
    }

    if (!timeGroup || timeGroup.time !== time || timeGroup.key !== key) {
      timeGroup = {
        time,
        key,
        items: [],
      }
      dateGroup.groups.push(timeGroup)
    }

    timeGroup.items.push(item)
  }
  return groups
}

// e.g. "July 1, 2026"
function formatDate(time: number, context: Context): string {
  return toLocaleDateTimeString(time, context, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// e.g. "12:51 AM"
function formatTime(time: number, context: Context): string {
  return toLocaleDateTimeString(time, context, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
