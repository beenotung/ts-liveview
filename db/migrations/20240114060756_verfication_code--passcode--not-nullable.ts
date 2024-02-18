import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('verification_code', table => {
    table.dropIndex(['passcode'])
  })
  {
    await knex.raw('delete from `verification_code` where `passcode` is null')
    const rows = await knex.select('id', 'passcode').from('verification_code')
    await knex.raw('alter table `verification_code` drop column `passcode`')
    await knex.raw(
      'alter table `verification_code` add column `passcode` char(6) not null',
    )
    for (let row of rows) {
      await knex('verification_code')
        .update({ passcode: row.passcode })
        .where({ id: row.id })
    }
  }
  await knex.schema.alterTable('verification_code', table => {
    table.index(['passcode'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('verification_code', table => {
    table.dropIndex(['passcode'])
  })
  {
    const rows = await knex.select('id', 'passcode').from('verification_code')
    await knex.raw('alter table `verification_code` drop column `passcode`')
    await knex.raw(
      'alter table `verification_code` add column `passcode` char(6) null',
    )
    for (let row of rows) {
      await knex('verification_code')
        .update({ passcode: row.passcode })
        .where({ id: row.id })
    }
  }
  await knex.schema.alterTable('verification_code', table => {
    table.index(['passcode'])
  })
}
