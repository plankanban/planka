module.exports.up = (knex) =>
  knex.schema.createTable('session', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id').notNullable();

    table.text('access_token').notNullable();
    table.text('remote_address').notNullable();
    table.text('user_agent');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.timestamp('deleted_at', true);

    /* Indexes */

    table.index('user_id');
    table.unique('access_token');
    table.index('remote_address');
  });

module.exports.down = (knex) => knex.schema.dropTable('session');
