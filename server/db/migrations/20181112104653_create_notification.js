module.exports.up = knex =>
  knex.schema.createTable('notification', table => {
    /* Columns */

    table.increments();

    table.integer('user_id').notNullable();
    table.integer('action_id').notNullable();
    table.integer('card_id').notNullable();

    table.boolean('is_read').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('user_id');
    table.index('action_id');
    table.index('card_id');
    table.index('is_read');
  });

module.exports.down = knex => knex.schema.dropTable('notification');
