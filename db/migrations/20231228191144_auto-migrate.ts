import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  {
    const rows = await knex.select('id', 'username').from('user')
    await knex.schema.alterTable('user', table =>
      table.dropUnique(['username']),
    )
    await knex.raw('alter table `user` drop column `username`')
    await knex.raw('alter table `user` add column `username` text null')
    await knex.schema.alterTable('user', table => table.unique(['username']))
    for (let row of rows) {
      await knex('user')
        .update({ username: row.username })
        .where({ id: row.id })
    }
  }
  // you may set it to be non-nullable with sqlite browser manually
}

export async function down(knex: Knex): Promise<void> {
  {
    const rows = await knex.select('id', 'passcode').from('verification_code')
    await knex.raw('alter table `verification_code` drop column `passcode`')
    await knex.raw(
      'alter table `verification_code` add column `passcode` text null',
    )
    for (let row of rows) {
      await knex('verification_code')
        .update({ passcode: row.passcode })
        .where({ id: row.id })
    }
  }
  // you may set it to be non-nullable with sqlite browser manually
}
