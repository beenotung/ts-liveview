import type { Knex } from 'knex'
import { dropIndexIfExists } from '../schema-helpers'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('verification_code', table => {
    table.index(['passcode'])
    table.index(['request_time'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await dropIndexIfExists(knex, 'verification_code', 'passcode')
  await dropIndexIfExists(knex, 'verification_code', 'request_time')
}
