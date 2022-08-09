module.exports.up = async (knex) =>
  knex.schema.table('user_account', (table) => {
    /* Columns */

    table.timestamp('password_changed_at', true);
  });

module.exports.down = async (knex) =>
  knex.schema.table('user_account', (table) => {
    table.dropColumn('password_changed_at');
  });
