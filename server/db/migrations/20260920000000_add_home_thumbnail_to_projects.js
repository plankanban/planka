/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// An optional image shown on the project's tile (home page, sidebar), chosen
// from the project's uploaded images independently of its background. When
// null, the tile falls back to the background.
module.exports.up = async (knex) => {
  await knex.schema.alterTable('project', (table) => {
    table.bigInteger('home_thumbnail_image_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('project', (table) => {
    table.dropColumn('home_thumbnail_image_id');
  });
};
