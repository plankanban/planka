module.exports.up = (knex) =>
  knex.schema.createTable('notification', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id').notNullable();
    table.bigInteger('action_id').notNullable();
    table.bigInteger('card_id').notNullable();

    table.boolean('is_read').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('user_id');
    table.index('action_id');
    table.index('card_id');
    table.index('is_read');
  });

module.exports.down = (knex) => knex.schema.dropTable('notification');
