import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('verification_code'))) {
    await knex.schema.createTable('verification_code', table => {
      table.increments('id')
      table.specificType('passcode', 'char(6)').nullable()
      table.string('email', 320).notNullable()
      table.integer('request_time').notNullable()
      table.timestamps(false, true)
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('verification_code')
}
