/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.alterTable('custom_field', (table) => {
    table.text('type').notNullable().defaultTo('text');
  });

  return knex.schema.alterTable('custom_field', (table) => {
    table.text('type').notNullable().alter();
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('custom_field', (table) => {
    table.dropColumn('type');
  });
