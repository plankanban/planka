module.exports.up = knex =>
  knex.schema.createTable('label', table => {
    /* Columns */

    table.increments();

    table.integer('board_id').notNullable();

    table.text('name').notNullable();
    table.text('color');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_id');
  });

module.exports.down = knex => knex.schema.dropTable('label');
