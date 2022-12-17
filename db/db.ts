import { DBInstance, newDB } from 'better-sqlite3-schema'
import { join } from 'path'

export let dbFile = join('data', 'db.sqlite3')

export let db: DBInstance = newDB({
  path: dbFile,
  migrate: false,
  fileMustExist: true,
  WAL: true,
})
