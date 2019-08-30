module.exports.up = knex =>
  knex.schema.createTable('project', table => {
    /* Columns */

    table.increments();

    table.text('name').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
  });

module.exports.down = knex => knex.schema.dropTable('project');
