/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    /* Columns */

    table.integer('comments_total').notNullable().defaultTo(0);
  });

  await knex.raw(`
    UPDATE card
    SET comments_total = comments_total_by_card_id.comments_total
    FROM (
      SELECT card_id, COUNT(*) as comments_total
      FROM comment
      GROUP BY card_id
    ) AS comments_total_by_card_id
    WHERE card.id = comments_total_by_card_id.card_id;
  `);

  return knex.schema.alterTable('card', (table) => {
    table.integer('comments_total').notNullable().alter();
  });
};

exports.down = (knex) =>
  knex.schema.table('card', (table) => {
    table.dropColumn('comments_total');
  });
