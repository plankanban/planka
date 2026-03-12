/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.boolean('is_public').notNullable().defaultTo(false);
    table.text('public_id');
    table.unique('public_id');
  });

exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.dropColumn('is_public');
    table.dropColumn('public_id');
  });
