/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.alterTable('webhook', (table) => {
    table.bigInteger('project_id');
    table.bigInteger('user_id');

    table.index('project_id');
    table.index('user_id');
  });

exports.down = (knex) =>
  knex.schema.alterTable('webhook', (table) => {
    table.dropIndex('user_id');
    table.dropIndex('project_id');

    table.dropColumn('user_id');
    table.dropColumn('project_id');
  });
