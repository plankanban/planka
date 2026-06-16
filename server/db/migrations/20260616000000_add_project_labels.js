/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.createTable("project_label", (table) => {
    /* Columns */

    table.bigInteger("id").primary().defaultTo(knex.raw("next_id()"));

    table.bigInteger("project_id").notNullable();

    table.specificType("position", "double precision").notNullable();
    table.text("name");
    table.text("color").notNullable();

    table.timestamp("created_at", true);
    table.timestamp("updated_at", true);

    /* Indexes */

    table.index("project_id");
    table.index("position");
  });
};

module.exports.down = (knex) => knex.schema.dropTableIfExists("project_label");
