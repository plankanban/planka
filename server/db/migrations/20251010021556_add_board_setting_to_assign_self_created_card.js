/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.boolean('assign_self_to_new_created_card').notNullable().defaultTo(false);
  });

  return knex.schema.alterTable('board', (table) => {
    table.boolean('assign_self_to_new_created_card').notNullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.alterTable('board', (table) => {
    table.dropColumn('assign_self_to_new_created_card');
  });
};
