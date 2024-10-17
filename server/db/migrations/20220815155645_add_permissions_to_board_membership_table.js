module.exports.up = async (knex) => {
  await knex.schema.table('board_membership', (table) => {
    /* Columns */

    table.text('role').notNullable().defaultTo('editor');
    table.boolean('can_comment');
  });

  return knex.schema.alterTable('board_membership', (table) => {
    table.text('role').notNullable().alter();
  });
};

module.exports.down = (knex) =>
  knex.schema.table('board_membership', (table) => {
    table.dropColumn('role');
    table.dropColumn('can_comment');
  });
