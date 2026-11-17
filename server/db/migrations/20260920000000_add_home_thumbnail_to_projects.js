/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// An optional image shown on the project's tile (home page, sidebar), chosen
// from the project's uploaded images, or a gradient preset, independently of
// its background. When both are null, the tile falls back to the background.
module.exports.up = async (knex) => {
  await knex.schema.alterTable('project', (table) => {
    table.bigInteger('home_thumbnail_image_id');
    table.text('home_thumbnail_gradient');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('project', (table) => {
    table.dropColumn('home_thumbnail_image_id');
    table.dropColumn('home_thumbnail_gradient');
  });
};
