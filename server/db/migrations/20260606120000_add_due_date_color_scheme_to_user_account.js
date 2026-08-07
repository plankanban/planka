/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.text('due_date_color_scheme').notNullable().defaultTo('default');
  });

  return knex.schema.alterTable('user_account', (table) => {
    table.text('due_date_color_scheme').notNullable().alter();
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('due_date_color_scheme');
  });
