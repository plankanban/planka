/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.boolean('display_label_placeholder_on_unlabeled_cards').notNullable().defaultTo(false);
  });

  return knex.schema.alterTable('board', (table) => {
    table.boolean('display_label_placeholder_on_unlabeled_cards').notNullable().alter();
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.dropColumn('display_label_placeholder_on_unlabeled_cards');
  });
