module.exports.up = async (knex) => {
  return knex.schema.table('attachment', (table) => {
    table.text('type');
    table.text('url');
    table.text('thumb');
  });
};

module.exports.down = async (knex) => {
  return knex.schema.table('attachment', (table) => {
    table.dropColumn('type');
    table.dropColumn('url');
    table.dropColumn('thumb');
  });
};
