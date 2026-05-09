/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.createTable('project_group_mapping', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('group_name').notNullable();
    table.bigInteger('project_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    table.unique(['group_name', 'project_id']);
    table.index('group_name');
    table.index('project_id');
  });

  await knex.schema.alterTable('project_manager', (table) => {
    table.boolean('is_from_group_sync').notNullable().defaultTo(false);
    table.text('source_group_name');

    table.index('is_from_group_sync');
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('project_manager', (table) => {
    table.dropIndex('is_from_group_sync');
    table.dropColumn('source_group_name');
    table.dropColumn('is_from_group_sync');
  });

  await knex.schema.dropTable('project_group_mapping');
};
