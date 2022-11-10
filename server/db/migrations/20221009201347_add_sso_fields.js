module.exports.up = async (knex) => {
  await knex.schema.table('user_account', (table) => {
    table.text('sso_id');
    table.text('sso_name');
  });

  await knex.schema.table('session', (table) => {
    table.text('sso_id');
  });
};

module.exports.down = (knex) => {
  knex.schema.table('user_account', (table) => {
    table.dropColumn('sso_id');
    table.dropColumn('sso_name');
  });

  knex.schema.table('session', (table) => {
    table.dropColumn('sso_id');
  });
};
