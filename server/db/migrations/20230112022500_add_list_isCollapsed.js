module.exports.up = (knex) =>
  knex.schema.alterTable('list', (table) => {
    table.boolean('is_collapsed').notNullable().defaultTo(false);
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('list', (table) => {
    table.dropColumn('is_collapsed');
  });
