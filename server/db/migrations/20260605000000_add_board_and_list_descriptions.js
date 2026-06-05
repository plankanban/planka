/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.text('description');
  });

  return knex.schema.alterTable('list', (table) => {
    table.text('description');
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('list', (table) => {
    table.dropColumn('description');
  });

  return knex.schema.alterTable('board', (table) => {
    table.dropColumn('description');
  });
};
