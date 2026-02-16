exports.up = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.boolean('is_public').notNullable().defaultTo(false);
    table.text('public_id');
    table.unique('public_id');
  });

exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.dropColumn('is_public');
    table.dropColumn('public_id');
  });
