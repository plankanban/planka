/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.createTable('card_relation', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('related_card_id').notNullable();
    table.specificType('kind', 'text').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['card_id', 'related_card_id', 'kind']);
    table.index('related_card_id');
    table.index('card_id');
    table.index('kind');
  });
};

exports.down = (knex) => knex.schema.dropTable('card_relation');
