/**
 * This file is auto generated, do not edit it manually.
 *
 * update command: npm run update
 */

import { proxySchema } from 'better-sqlite3-proxy'
import { db } from './db'


export type DBProxy = {
}

export let proxy = proxySchema<DBProxy>({
  db,
  tableFields: {
  },
})
