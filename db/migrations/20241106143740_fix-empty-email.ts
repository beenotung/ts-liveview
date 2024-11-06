import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE "user" SET email = NULL WHERE email = ''
  `)
}

export async function down(knex: Knex): Promise<void> {}
