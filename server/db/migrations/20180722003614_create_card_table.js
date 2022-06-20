module.exports.up = (knex) =>
  knex.schema.createTable('card', async (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id').notNullable();
    table.bigInteger('list_id');
    table.bigInteger('creator_user_id').notNullable();
    table.bigInteger('cover_attachment_id');

    table.specificType('position', 'double precision');
    table.text('name').notNullable();
    table.text('description');
    table.timestamp('due_date', true);
    table.jsonb('timer');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_id');
    table.index('list_id');
    table.index('position');
  });

module.exports.down = (knex) => knex.schema.dropTable('card');
