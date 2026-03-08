/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('config', (table) => {
    // Appearance / White-label
    table.text('login_logo_url');
    table.text('login_app_name');
    table.boolean('hide_powered_by').notNullable().defaultTo(false);
    table.text('login_background_url');
    // Registration
    table.boolean('registration_enabled').notNullable().defaultTo(false);
  });

  return knex.schema.alterTable('config', (table) => {
    table.boolean('hide_powered_by').notNullable().alter();
    table.boolean('registration_enabled').notNullable().alter();
  });
};

exports.down = (knex) =>
  knex.schema.alterTable('config', (table) => {
    table.dropColumn('login_logo_url');
    table.dropColumn('login_app_name');
    table.dropColumn('hide_powered_by');
    table.dropColumn('login_background_url');
    table.dropColumn('registration_enabled');
  });
