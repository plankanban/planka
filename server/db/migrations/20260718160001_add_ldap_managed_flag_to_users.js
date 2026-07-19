/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.boolean('is_ldap_user').notNullable().defaultTo(false);
  });

exports.down = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('is_ldap_user');
  });
