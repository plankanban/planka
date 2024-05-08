module.exports.up = async (knex) => {
  await knex.schema.createTable('identity_provider_user', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id').notNullable();

    table.text('issuer').notNullable();
    table.text('sub').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['issuer', 'sub']);
    table.index('user_id');
  });

  await knex.schema.table('user_account', (table) => {
    /* Columns */

    table.boolean('is_sso').notNullable().default(false);

    /* Modifications */

    table.setNullable('password');
  });

  return knex.schema.alterTable('user_account', (table) => {
    table.boolean('is_sso').notNullable().alter();
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('identity_provider_user');

  return knex.schema.table('user_account', (table) => {
    table.dropColumn('is_sso');

    table.dropNullable('password');
  });
};
