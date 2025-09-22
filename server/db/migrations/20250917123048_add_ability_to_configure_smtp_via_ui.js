/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('config', (table) => {
    /* Columns */

    table.text('smtp_host');
    table.integer('smtp_port');
    table.text('smtp_name');
    table.boolean('smtp_secure').notNullable().defaultTo(false);
    table.boolean('smtp_tls_reject_unauthorized').notNullable().defaultTo(true);
    table.text('smtp_user');
    table.text('smtp_password');
    table.text('smtp_from');
  });

  return knex.schema.alterTable('config', (table) => {
    table.boolean('smtp_secure').notNullable().alter();
    table.boolean('smtp_tls_reject_unauthorized').notNullable().alter();
  });
};

exports.down = (knex) =>
  knex.schema.alterTable('config', (table) => {
    table.dropColumn('smtp_host');
    table.dropColumn('smtp_port');
    table.dropColumn('smtp_name');
    table.dropColumn('smtp_secure');
    table.dropColumn('smtp_tls_reject_unauthorized');
    table.dropColumn('smtp_user');
    table.dropColumn('smtp_password');
    table.dropColumn('smtp_from');
  });
