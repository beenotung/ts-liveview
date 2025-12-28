/**
 * This file is auto generated, do not edit it manually.
 *
 * update command: npm run update
 */

import { proxySchema } from 'better-sqlite3-proxy'
import { db } from './db'

export type Task = {
  id?: null | number
  title: string
  completed: boolean
}

export type DBProxy = {
  task: Task[]
}

export let proxy = proxySchema<DBProxy>({
  db,
  tableFields: {
    task: [],
  },
})
