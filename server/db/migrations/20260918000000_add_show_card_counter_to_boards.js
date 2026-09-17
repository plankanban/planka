/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Whether a list says how many cards it holds, on its add-card button. Off by
// default: a count is useful to a board that is being kept to a size and noise
// to one that is not.
module.exports.up = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.boolean('show_card_counter').notNullable().defaultTo(false);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.dropColumn('show_card_counter');
  });
};
