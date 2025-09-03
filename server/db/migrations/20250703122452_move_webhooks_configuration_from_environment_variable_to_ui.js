/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.createTable('webhook', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id');

    table.text('name').notNullable();
    table.text('url').notNullable();
    table.text('access_token');
    table.specificType('events', 'text[]');
    table.specificType('excluded_events', 'text[]');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_id');
  });

exports.down = (knex) => knex.schema.dropTable('webhook');
