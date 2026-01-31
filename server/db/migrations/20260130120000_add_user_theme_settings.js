/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.jsonb('theme_settings');
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('theme_settings');
  });
};
