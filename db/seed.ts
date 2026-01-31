import { seedRow } from 'better-sqlite3-proxy'
import { proxy } from './proxy'

// This file serve like the knex seed file.
//
// You can setup the database with initial config and sample data via the db proxy.

seedRow(proxy.task, { title: 'Try ts-liveview' }, { completed: true })
seedRow(proxy.task, { title: 'Edit the home page' }, { completed: false })
seedRow(proxy.task, { title: 'Create a new page' }, { completed: false })
seedRow(proxy.task, { title: 'Share your thoughts' }, { completed: false })
