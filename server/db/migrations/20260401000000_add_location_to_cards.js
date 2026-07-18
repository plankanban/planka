/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.jsonb('location').defaultTo(null);
  });

exports.down = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.dropColumn('location');
  });
