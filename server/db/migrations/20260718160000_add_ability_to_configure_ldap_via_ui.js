/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.alterTable('config', (table) => {
    /* Columns */

    table.boolean('ldap_enabled').notNullable().defaultTo(false);
    table.text('ldap_host');
    table.integer('ldap_port');
    table.boolean('ldap_tls').notNullable().defaultTo(false);
    table.text('ldap_bind_dn');
    table.text('ldap_bind_password');
    table.text('ldap_base_dn');
    table.text('ldap_user_filter');
    table.text('ldap_name_attribute');
    table.text('ldap_email_attribute');
    table.text('ldap_username_attribute');
    table.text('ldap_roles_attribute');
    table.jsonb('ldap_admin_roles').notNullable().defaultTo('[]');
    table.jsonb('ldap_project_owner_roles').notNullable().defaultTo('[]');
    table.jsonb('ldap_board_user_roles').notNullable().defaultTo('[]');
    table.boolean('ldap_ssh_tunnel_enabled').notNullable().defaultTo(false);
    table.text('ldap_ssh_host');
    table.integer('ldap_ssh_port');
    table.text('ldap_ssh_username');
    table.text('ldap_ssh_password');
    table.text('ldap_ssh_remote_host');
    table.integer('ldap_ssh_remote_port');
  });

exports.down = (knex) =>
  knex.schema.alterTable('config', (table) => {
    table.dropColumn('ldap_enabled');
    table.dropColumn('ldap_host');
    table.dropColumn('ldap_port');
    table.dropColumn('ldap_tls');
    table.dropColumn('ldap_bind_dn');
    table.dropColumn('ldap_bind_password');
    table.dropColumn('ldap_base_dn');
    table.dropColumn('ldap_user_filter');
    table.dropColumn('ldap_name_attribute');
    table.dropColumn('ldap_email_attribute');
    table.dropColumn('ldap_username_attribute');
    table.dropColumn('ldap_roles_attribute');
    table.dropColumn('ldap_admin_roles');
    table.dropColumn('ldap_project_owner_roles');
    table.dropColumn('ldap_board_user_roles');
    table.dropColumn('ldap_ssh_tunnel_enabled');
    table.dropColumn('ldap_ssh_host');
    table.dropColumn('ldap_ssh_port');
    table.dropColumn('ldap_ssh_username');
    table.dropColumn('ldap_ssh_password');
    table.dropColumn('ldap_ssh_remote_host');
    table.dropColumn('ldap_ssh_remote_port');
  });
