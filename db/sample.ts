import { proxy } from './proxy'

// This file serve like the knex seed file.
//
// You can setup the database with sample data via the db proxy.

console.log(
  'received methods:',
  proxy.method.map(row => row.method),
)
