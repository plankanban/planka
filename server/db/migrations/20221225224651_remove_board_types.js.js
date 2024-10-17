module.exports.up = async (knex) => {
  await knex.schema.table('board', (table) => {
    table.dropColumn('type');
  });

  return knex.schema.table('card', (table) => {
    table.dropNullable('list_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.table('board', (table) => {
    /* Columns */

    table.text('type').notNullable().defaultTo('kanban'); // FIXME: drop default
  });

  return knex.schema.table('card', (table) => {
    table.setNullable('list_id');
  });
};
