module.exports.up = async (knex) => {
  await knex.schema.table('card', (table) => {
    /* Columns */

    table.boolean('is_due_date_completed');
  });

  return knex('card')
    .update({
      isDueDateCompleted: false,
    })
    .whereNotNull('due_date');
};

module.exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.dropColumn('is_due_date_completed');
  });
