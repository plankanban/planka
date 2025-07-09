/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    /* Columns */

    table.boolean('is_closed').notNullable().default(false);
  });

  await knex.raw(`
    UPDATE card
    SET is_closed = TRUE
    FROM list
    WHERE card.list_id = list.id AND list.type = 'closed';
  `);

  return knex.schema.alterTable('card', (table) => {
    table.boolean('is_closed').notNullable().alter();
  });
};

exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.dropColumn('is_closed');
  });
