module.exports.up = async (knex) =>
  knex.schema.table('session', (table) => {
    /* Columns */

    table.text('http_only_token');
  });

module.exports.down = (knex) =>
  knex.schema.table('session', (table) => {
    table.dropColumn('http_only_token');
  });
