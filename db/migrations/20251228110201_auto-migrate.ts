import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('geo_ip_parts'))) {
    await knex.schema.createTable('geo_ip_parts', table => {
      table.increments('id')
      table.text('hash').notNullable().unique()
      table.text('content').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('geo_ip'))) {
    await knex.schema.createTable('geo_ip', table => {
      table.increments('id')
      table.text('hash').notNullable().unique()
      table.text('content').notNullable()
      table.timestamps(false, true)
    })
  }
  await knex.raw('alter table `request_log` add column `geo_ip_id` integer null references `geo_ip`(`id`)')
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(`request_log`, table => table.dropColumn(`geo_ip_id`))
  await knex.schema.dropTableIfExists('geo_ip')
  await knex.schema.dropTableIfExists('geo_ip_parts')
}
