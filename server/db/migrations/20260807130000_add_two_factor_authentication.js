/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.text('totp_secret');
    table.boolean('is_totp_enabled').notNullable().defaultTo(false);
    table.timestamp('totp_enabled_at', true);
    table.jsonb('totp_recovery_codes');
  });

  return knex.schema.createTable('trusted_device', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id').notNullable();

    table.text('token_hash').notNullable();
    table.text('user_agent_summary');

    table.text('browser_name');
    table.text('browser_version');
    table.text('os_name');
    table.text('os_version');
    table.text('device_type');
    table.text('device_vendor');
    table.text('device_model');
    table.text('label');

    table.timestamp('expires_at', true).notNullable();
    table.timestamp('last_used_at', true);

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index(['user_id', 'expires_at']);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('trusted_device');

  return knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('totp_secret');
    table.dropColumn('is_totp_enabled');
    table.dropColumn('totp_enabled_at');
    table.dropColumn('totp_recovery_codes');
  });
};
