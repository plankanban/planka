/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.createTable('internal_config', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('storage_limit');
    table.integer('active_users_limit');
    table.boolean('is_initialized').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
  });

  const { is_initialized: isInitialized } = await knex('config').select('is_initialized').first();

  await knex('internal_config').insert({
    isInitialized,
    id: 1,
    createdAt: new Date().toISOString(),
  });

  return knex.schema.alterTable('config', (table) => {
    table.dropColumn('is_initialized');
  });
};

exports.down = async (knex) => {
  const { is_initialized: isInitialized } = await knex('internal_config')
    .select('is_initialized')
    .first();

  await knex.schema.alterTable('config', (table) => {
    table.boolean('is_initialized').notNullable().default(isInitialized);
  });

  await knex.schema.alterTable('config', (table) => {
    table.boolean('is_initialized').notNullable().alter();
  });

  return knex.schema.dropTable('internal_config');
};
