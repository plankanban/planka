module.exports.up = async (knex) =>
  knex.schema.table('user_account', (table) => {
    /* Columns */

    table.text('language');
  });

module.exports.down = async (knex) =>
  knex.schema.table('user_account', (table) => {
    table.dropColumn('language');
  });
