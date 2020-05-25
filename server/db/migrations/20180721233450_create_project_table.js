module.exports.up = (knex) =>
  knex.schema.createTable('project', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('name').notNullable();
    table.jsonb('background');
    table.text('background_image_dirname');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
  });

module.exports.down = (knex) => knex.schema.dropTable('project');
