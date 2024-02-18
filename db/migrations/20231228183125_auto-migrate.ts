import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    'alter table `verification_code` add column `revoke_time` integer null',
  )

  if (!(await knex.schema.hasTable('verification_attempt'))) {
    await knex.schema.createTable('verification_attempt', table => {
      table.increments('id')
      table.specificType('passcode', 'char(6)').notNullable()
      table.string('email', 320).notNullable()
      table
        .integer('match_id')
        .unsigned()
        .nullable()
        .references('verification_code.id')
      table.timestamps(false, true)
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('verification_attempt')
  await knex.raw('alter table `verification_code` drop column `revoke_time`')
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
}
