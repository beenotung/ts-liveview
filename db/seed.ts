import { seedRow } from 'better-sqlite3-proxy'
import { proxy } from './proxy'

// This file serve like the knex seed file.
//
// You can setup the database with initial config and sample data via the db proxy.

seedRow(proxy.method, { method: 'GET' })
seedRow(proxy.method, { method: 'POST' })
seedRow(proxy.method, { method: 'ws' })

console.log(
  'request methods:',
  proxy.method.map(row => row.method),
)
