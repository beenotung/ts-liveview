import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  let attempts = await knex
    .select('id', 'match_id')
    .from('verification_attempt')
    .whereNotNull('match_id')
  await knex.schema.alterTable('verification_attempt', table =>
    table.dropColumn('match_id'),
  )
  await knex.raw(
    'alter table `verification_code` add column `match_id` integer null references `verification_attempt`(`id`)',
  )
  await knex.raw(
    'alter table `verification_code` add column `user_id` integer null references `user`(`id`)',
  )
  for (let attempt of attempts) {
    await knex('verification_code')
      .update({ match_id: attempt.id })
      .where({ id: attempt.match_id })
  }
  await knex.raw(`
    update verification_code
    set user_id = (select id from user where user.email = verification_code.email)
    where match_id is not null
  `)
}

export async function down(knex: Knex): Promise<void> {
  let attempts = await knex.select('id', 'match_id').from('verification_code')
  await knex.raw('alter table `verification_code` drop column `user_id`')
  await knex.raw('alter table `verification_code` drop column `match_id`')
  await knex.raw(
    'alter table `verification_attempt` add column `match_id` integer null references `verification_code`(`id`)',
  )
  for (let attempt of attempts) {
    await knex('verification_attempt')
      .update({ match_id: attempt.id })
      .where({ id: attempt.match_id })
  }
}
