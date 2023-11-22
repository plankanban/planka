module.exports.up = async (knex) => {
  return knex.schema.table('user_account', (table) => {
    table.boolean('locked').default(false);
  });
};

module.exports.down = async (knex) => {
  return knex.schema.table('user_account', (table) => {
    table.dropColumn('locked');
  });
};
