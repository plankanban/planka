module.exports.up = knex =>
  knex.schema.createTable('board', table => {
    /* Columns */

    table.increments();

    table.integer('project_id').notNullable();

    table.specificType('position', 'double precision').notNullable();
    table.text('name').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
    table.index('position');
  });

module.exports.down = knex => knex.schema.dropTable('board');
