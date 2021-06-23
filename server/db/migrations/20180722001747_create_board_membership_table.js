module.exports.up = (knex) =>
  knex.schema.createTable('board_membership', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['board_id', 'user_id']);
    table.index('user_id');
  });

module.exports.down = (knex) => knex.schema.dropTable('board_membership');
