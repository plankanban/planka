/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.text('api_key_prefix');
    table.text('api_key_hash');

    table.timestamp('api_key_created_at', true);

    /* Indexes */

    table.unique('api_key_hash');
  });

exports.down = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('api_key_prefix');
    table.dropColumn('api_key_hash');
    table.dropColumn('api_key_created_at');
  });
