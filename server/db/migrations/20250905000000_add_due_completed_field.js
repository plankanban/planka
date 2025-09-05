exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    /* Columns */

    table.boolean('due_completed').notNullable().defaultTo(false);
  });
};

exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.dropColumn('due_completed');
  });
