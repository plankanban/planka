module.exports.up = async (knex) => {
  return knex.schema.table('user_account', (table) => {
    table.setNullable('password');
  });
};

module.exports.down = async (knex) => {
  return knex.schema.table('user_account', (table) => {
    table.dropNullable('password');
  });
};
