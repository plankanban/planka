/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.createTable('config', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.boolean('is_initialized').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
  });

  await knex.schema.alterTable('session', (table) => {
    /* Columns */

    table.text('pending_token');

    /* Modifications */

    table.setNullable('access_token');

    /* Indexes */

    table.unique('pending_token');
  });

  await knex.schema.alterTable('user_account', (table) => {
    /* Columns */

    table.text('terms_signature');

    table.timestamp('terms_accepted_at', true);
  });

  const isInitialized = !!(await knex('user_account').first());

  await knex('config').insert({
    isInitialized,
    id: 1,
    createdAt: new Date().toISOString(),
  });

  await knex('session')
    .update({
      deletedAt: new Date().toISOString(),
    })
    .whereNull('deletedAt');
};

exports.down = async (knex) => {
  await knex.schema.dropTable('config');

  await knex('session').del().whereNull('access_token');

  await knex.schema.alterTable('session', (table) => {
    table.dropColumn('pending_token');

    table.dropNullable('access_token');
  });

  return knex.schema.table('user_account', (table) => {
    table.dropColumn('terms_signature');
    table.dropColumn('terms_accepted_at');
  });
};
