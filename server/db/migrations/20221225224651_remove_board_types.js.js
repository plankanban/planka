module.exports.up = async (knex) => {
  await knex.schema.table('board', (table) => {
    table.dropColumn('type');
  });

  return knex.schema.alterTable('card', (table) => {
    table.bigInteger('list_id').notNullable().alter();
  });
};

module.exports.down = async (knex) => {
  await knex.schema.table('board', (table) => {
    /* Columns */

    table.text('type').notNullable().defaultTo('kanban');
  });

  return knex.schema.alterTable('card', (table) => {
    table.bigInteger('list_id').alter();
  });
};
