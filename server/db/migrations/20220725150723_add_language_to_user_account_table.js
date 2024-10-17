module.exports.up = (knex) =>
  knex.schema.table('user_account', (table) => {
    /* Columns */

    table.text('language');
  });

module.exports.down = (knex) =>
  knex.schema.table('user_account', (table) => {
    table.dropColumn('language');
  });
