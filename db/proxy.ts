import { proxySchema } from 'better-sqlite3-proxy'
import { db } from './db'


export type DBProxy = {
}

export let proxy = proxySchema<DBProxy>({
  db,
  tableFields: {
  },
})
