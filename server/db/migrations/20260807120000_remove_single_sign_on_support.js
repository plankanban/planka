/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/*
 * Single sign-on support has been removed. Accounts that were provisioned through an
 * identity provider have no local password, so they would silently become unusable once
 * the flag is gone. They are deactivated first, which makes their state visible in the
 * administration UI: an admin can set a password and reactivate them afterwards.
 *
 * The down migration restores the schema, but not the data - the provider links and the
 * information about which accounts were externally managed are gone for good.
 */

module.exports.up = async (knex) => {
  await knex('user_account').where('is_sso_user', true).update({
    is_deactivated: true,
  });

  await knex.schema.dropTable('identity_provider_user');

  return knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('is_sso_user');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.boolean('is_sso_user').notNullable().defaultTo(false);
  });

  return knex.schema.createTable('identity_provider_user', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id').notNullable();

    table.text('issuer').notNullable();
    table.text('sub').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['issuer', 'sub']);
    table.index('user_id');
  });
};
