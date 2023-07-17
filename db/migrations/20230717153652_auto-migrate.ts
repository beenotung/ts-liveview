import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `request_log` add column `user_id` integer null references `user`(`id`)')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `request_log` drop column `user_id`')
}
