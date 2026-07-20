/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = (knex) =>
  knex.schema.alterTable('config', (table) => {
    table.text('ldap_ssh_host_key_fingerprint');
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('config', (table) => {
    table.dropColumn('ldap_ssh_host_key_fingerprint');
  });
