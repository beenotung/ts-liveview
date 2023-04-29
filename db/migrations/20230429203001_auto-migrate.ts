import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    'alter table `user_agent` add column `count` integer not null default 0',
  )
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `user_agent` drop column `count`')
}
