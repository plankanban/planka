module.exports.up = (knex) =>
  knex.schema.createTable('archive', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('from_model').notNullable();
    table.bigInteger('original_record_id').notNullable();
    table.json('original_record').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['from_model', 'original_record_id']);
  });

module.exports.down = (knex) => knex.schema.dropTable('archive');
