module.exports.up = (knex) => knex.schema.createTable('card', (table) => {
  /* Columns */

  table
    .bigInteger('id')
    .primary()
    .defaultTo(knex.raw('next_id()'));

  table.bigInteger('list_id').notNullable();
  table.bigInteger('board_id').notNullable();

  table.specificType('position', 'double precision').notNullable();
  table.text('name').notNullable();
  table.text('description');
  table.timestamp('dueDate', true);
  table.jsonb('timer');

  table.timestamp('created_at', true);
  table.timestamp('updated_at', true);

  /* Indexes */

  table.index('list_id');
  table.index('position');
});

module.exports.down = (knex) => knex.schema.dropTable('card');
