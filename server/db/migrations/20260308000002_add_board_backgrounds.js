/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.text('background_type');
    table.text('background_gradient');
  });

exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.dropColumn('background_type');
    table.dropColumn('background_gradient');
  });
