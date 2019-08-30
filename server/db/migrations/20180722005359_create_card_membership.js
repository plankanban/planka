module.exports.up = knex =>
  knex.schema.createTable('card_membership', table => {
    /* Columns */

    table.increments();

    table.integer('card_id').notNullable();
    table.integer('user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['card_id', 'user_id']);
    table.index('user_id');
  });

module.exports.down = knex => knex.schema.dropTable('card_membership');
