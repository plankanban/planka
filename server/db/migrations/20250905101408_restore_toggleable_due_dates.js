/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    /* Columns */

    table.boolean('is_due_completed');
  });

  return knex('card')
    .update({
      isDueCompleted: false,
    })
    .whereNotNull('due_date');
};

exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.dropColumn('is_due_completed');
  });
