module.exports.up = async (knex) => knex.schema.table('card', (table) => {
  /* Columns */

  table.boolean('due_completed').notNullable().defaultTo(false);
});


module.exports.down = async (knex) => {
  await knex.schema.table('card', (table) => {
    table.dropColumn('due_completed');
  });
};
