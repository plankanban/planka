/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    /* Columns */

    table.jsonb('repeat_rule');
    table.bigInteger('repeat_list_id');
    table.timestamp('repeat_next_at', true);

    /* Indexes */

    table.index('repeat_list_id');
    table.index('repeat_next_at');
  });
};

exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.dropColumn('repeat_rule');
    table.dropColumn('repeat_list_id');
    table.dropColumn('repeat_next_at');
  });
