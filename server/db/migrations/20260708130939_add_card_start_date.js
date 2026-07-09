/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.timestamp('start_date', true);
  });
};

exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.dropColumn('start_date');
  });
