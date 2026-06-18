/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.alterTable('label', (table) => {
    table.bigInteger('project_label_id');
    table.index('project_label_id');
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('label', (table) => {
    table.dropColumn('project_label_id');
  });
