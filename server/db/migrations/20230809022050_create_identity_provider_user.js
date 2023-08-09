module.exports.up = (knex) =>
  knex.schema.createTable('identity_provider_user', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table
      .bigInteger('user_id')
      .notNullable()
      .references('id')
      .inTable('user_account')
      .onDelete('CASCADE');

    table.text('issuer').notNullable();
    table.text('sub').notNullable();

    /* Indexes */

    table.index('user_id');
  });

module.exports.down = (knex) => knex.schema.dropTable('identity_provider_user');
