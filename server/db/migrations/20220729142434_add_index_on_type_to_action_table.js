module.exports.up = (knex) =>
  knex.schema.table('action', (table) => {
    /* Indexes */

    table.index('type');
  });

module.exports.down = (knex) =>
  knex.schema.table('action', (table) => {
    table.dropIndex('type');
  });
