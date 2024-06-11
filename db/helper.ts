import { fromSqliteTimestamp } from 'better-sqlite3-proxy'

export function getRowTimes<T extends { id?: number }>(row: T) {
  let r = row as any
  let created_at = fromSqliteTimestamp(r.created_at)
  let updated_at = fromSqliteTimestamp(r.updated_at)
  return { created_at, updated_at }
}
