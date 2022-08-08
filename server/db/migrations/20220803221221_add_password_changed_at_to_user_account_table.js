module.exports.up = async (knex) =>
  knex.schema.table('user_account', (table) => {
    /* Columns */

    table.timestamp('password_changed_at', true).defaultsTo(new Date(0).toUTCString());
  });

module.exports.down = async (knex) =>
  knex.schema.table('user_account', (table) => {
    table.dropColumn('password_changed_at');
  });
