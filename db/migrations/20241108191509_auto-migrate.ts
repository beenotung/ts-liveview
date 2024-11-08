import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  {
    // alter column (verification_attempt.email) to be nullable

    let verification_attempt_rows = await knex.select('*').from('verification_attempt')
    let verification_code_rows = await knex.select('*').from('verification_code')

    await knex.schema.dropTable('verification_code')
    await knex.schema.dropTable('verification_attempt')

    if (!(await knex.schema.hasTable('verification_attempt'))) {
      await knex.schema.createTable('verification_attempt', table => {
        table.increments('id')
        table.specificType('passcode', 'char(6)').notNullable()
        table.string('email', 320).nullable()
        table.string('tel', 16).nullable()
        table.timestamps(false, true)
      })
    }
    if (!(await knex.schema.hasTable('verification_code'))) {
      await knex.schema.createTable('verification_code', table => {
        table.increments('id')
        table.text('uuid').nullable().unique()
        table.specificType('passcode', 'char(6)').notNullable()
        table.string('email', 320).nullable()
        table.string('tel', 16).nullable()
        table.integer('request_time').notNullable()
        table.integer('revoke_time').nullable()
        table.integer('match_id').unsigned().nullable().references('verification_attempt.id')
        table.integer('user_id').unsigned().nullable().references('user.id')
        table.timestamps(false, true)
      })
    }

    for (let row of verification_attempt_rows) {
      await knex.insert(row).into('verification_attempt')
    }
    for (let row of verification_code_rows) {
      await knex.insert(row).into('verification_code')
    }
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  {
    // alter column (verification_attempt.email) to be non-nullable

    let verification_attempt_rows = await knex.select('*').from('verification_attempt')
    let verification_code_rows = await knex.select('*').from('verification_code')

    await knex.schema.dropTable('verification_code')
    await knex.schema.dropTable('verification_attempt')

    if (!(await knex.schema.hasTable('verification_attempt'))) {
      await knex.schema.createTable('verification_attempt', table => {
        table.increments('id')
        table.specificType('passcode', 'char(6)').notNullable()
        table.string('email', 320).notNullable()
        table.timestamps(false, true)
      })
    }
    if (!(await knex.schema.hasTable('verification_code'))) {
      await knex.schema.createTable('verification_code', table => {
        table.increments('id')
        table.text('uuid').nullable().unique()
        table.specificType('passcode', 'char(6)').notNullable()
        table.string('email', 320).nullable()
        table.string('tel', 16).nullable()
        table.integer('request_time').notNullable()
        table.integer('revoke_time').nullable()
        table.integer('match_id').unsigned().nullable().references('verification_attempt.id')
        table.integer('user_id').unsigned().nullable().references('user.id')
        table.timestamps(false, true)
      })
    }

    for (let row of verification_attempt_rows) {
      await knex.insert(row).into('verification_attempt')
    }
    for (let row of verification_code_rows) {
      await knex.insert(row).into('verification_code')
    }
  }
}
