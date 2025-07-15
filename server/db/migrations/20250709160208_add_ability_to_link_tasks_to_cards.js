/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) =>
  knex.schema.alterTable('task', (table) => {
    /* Columns */

    table.bigInteger('linked_card_id');

    /* Indexes */

    table.index('linked_card_id');
  });

exports.down = (knex) =>
  knex.schema.table('task', (table) => {
    table.dropColumn('linked_card_id');
  });
