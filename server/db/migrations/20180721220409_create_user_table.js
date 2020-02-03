module.exports.up = knex =>
  knex.schema
    .createTable('user', table => {
      /* Columns */

      table
        .bigInteger('id')
        .primary()
        .defaultTo(knex.raw('next_id()'));

      table.text('email').notNullable();
      table.text('password').notNullable();
      table.boolean('is_admin').notNullable();
      table.text('name').notNullable();
      table.text('avatar');

      table.timestamp('created_at', true);
      table.timestamp('updated_at', true);
      table.timestamp('deleted_at', true);
    })
    .raw(
      'ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" EXCLUDE ("email" WITH =) WHERE ("deleted_at" IS NULL)',
    );

module.exports.down = knex => knex.schema.dropTable('user');
