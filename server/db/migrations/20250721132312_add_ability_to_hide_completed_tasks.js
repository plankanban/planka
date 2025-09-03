/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('task_list', (table) => {
    /* Columns */

    table.boolean('hide_completed_tasks').notNullable().defaultTo(false);
  });

  return knex.schema.alterTable('task_list', (table) => {
    table.boolean('hide_completed_tasks').notNullable().alter();
  });
};

exports.down = (knex) =>
  knex.schema.table('task_list', (table) => {
    table.dropColumn('hide_completed_tasks');
  });
