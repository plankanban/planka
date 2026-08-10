/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('board_membership', (table) => {
    /* Columns */

    table.boolean('limit_access_to_assigned').defaultTo(false);
  });

  return knex.schema.alterTable('board_membership', (table) => {
    table.boolean('limit_access_to_assigned').alter();
  });
};

exports.down = (knex) =>
  knex.schema.alterTable('board_membership', (table) => {
    table.dropColumn('limit_access_to_assigned');
  });
