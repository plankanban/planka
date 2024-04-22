exports.up = async (knex) => {
  await knex.schema.table('card', (table) => {
    table.enum('status', ['active', 'archived']).defaultTo('active').notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.table('card', (table) => {
    table.dropColumn('status');
  });
};
