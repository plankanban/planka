/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) => {
  return knex.schema.alterTable('user_account', (table) => {
    table.string('api_key_prefix', 255).unique().nullable();
    table.string('api_key_hash', 255).nullable();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable('user_account', (table) => {
    table.dropUnique(['api_key_prefix']);
    table.dropColumn('api_key_prefix');
    table.dropColumn('api_key_hash');
  });
};
