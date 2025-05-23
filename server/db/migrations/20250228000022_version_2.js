/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.raw(`
    CREATE EXTENSION pg_trgm;

    CREATE SEQUENCE next_id_seq;
    CREATE FUNCTION next_id(OUT id BIGINT) AS $$
      DECLARE
        shard INT := 1;
        epoch BIGINT := 1567191600000;
        sequence BIGINT;
        milliseconds BIGINT;
      BEGIN
        SELECT nextval('next_id_seq') % 1024 INTO sequence;
        SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO milliseconds;
        id := (milliseconds - epoch) << 23;
        id := id | (shard << 10);
        id := id | (sequence);
      END;
    $$ LANGUAGE PLPGSQL;
  `);

  await knex.schema.createTable('file_reference', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.integer('total');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('total');
  });

  await knex.schema
    .createTable('user_account', (table) => {
      /* Columns */

      table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

      table.text('email').notNullable();
      table.text('password');
      table.text('role').notNullable();
      table.text('name').notNullable();
      table.text('username');
      table.jsonb('avatar');
      table.text('phone');
      table.text('organization');
      table.text('language');
      table.boolean('subscribe_to_own_cards').notNullable();
      table.boolean('subscribe_to_card_when_commenting').notNullable();
      table.boolean('turn_off_recent_card_highlighting').notNullable();
      table.boolean('enable_favorites_by_default').notNullable();
      table.text('default_editor_mode').notNullable();
      table.text('default_home_view').notNullable();
      table.text('default_projects_order').notNullable();
      table.boolean('is_sso_user').notNullable();
      table.boolean('is_deactivated').notNullable();

      table.timestamp('created_at', true);
      table.timestamp('updated_at', true);
      table.timestamp('password_changed_at', true);

      /* Indexes */

      table.unique('email');
      table.index('role');
      table.index('username');
      table.index('is_deactivated');
    })
    .raw(
      'ALTER TABLE user_account ADD CONSTRAINT user_account_username_unique EXCLUDE (username WITH =) WHERE (username IS NOT NULL);',
    );

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

  await knex.schema.createTable('session', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id').notNullable();

    table.text('access_token').notNullable();
    table.text('http_only_token');
    table.text('remote_address').notNullable();
    table.text('user_agent');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.timestamp('deleted_at', true);

    /* Indexes */

    table.index('user_id');
    table.unique('access_token');
    table.index('remote_address');
  });

  await knex.schema.createTable('project', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('owner_project_manager_id');
    table.bigInteger('background_image_id');

    table.text('name').notNullable();
    table.text('description');
    table.text('background_type');
    table.text('background_gradient');
    table.boolean('is_hidden').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('owner_project_manager_id');
  });

  await knex.schema.createTable('project_favorite', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['project_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('project_manager', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['project_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('background_image', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();

    table.text('dirname').notNullable();
    table.text('extension').notNullable();
    table.bigInteger('size_in_bytes').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
  });

  await knex.schema.createTable('base_custom_field_group', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();

    table.text('name').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
  });

  await knex.schema.createTable('board', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();

    table.specificType('position', 'double precision').notNullable();
    table.text('name').notNullable();
    table.text('default_view').notNullable();
    table.text('default_card_type').notNullable();
    table.boolean('limit_card_types_to_default_one').notNullable();
    table.boolean('always_display_card_creator').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
    table.index('position');
  });

  await knex.schema.createTable('board_subscription', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['board_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('board_membership', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();
    table.bigInteger('board_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.text('role').notNullable();
    table.boolean('can_comment');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
    table.unique(['board_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('label', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id').notNullable();

    table.specificType('position', 'double precision').notNullable();
    table.text('name');
    table.text('color').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_id');
    table.index('position');
  });

  await knex.schema.createTable('list', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id').notNullable();

    table.text('type').notNullable();
    table.specificType('position', 'double precision');
    table.text('name');
    table.text('color');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_id');
    table.index('type');
    table.index('position');
  });

  await knex.schema.createTable('card', async (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id').notNullable();
    table.bigInteger('list_id').notNullable();
    table.bigInteger('creator_user_id');
    table.bigInteger('prev_list_id');
    table.bigInteger('cover_attachment_id');

    table.text('type').notNullable();
    table.specificType('position', 'double precision');
    table.text('name').notNullable();
    table.text('description');
    table.timestamp('due_date', true);
    table.jsonb('stopwatch');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.timestamp('list_changed_at', true);

    /* Indexes */

    table.index('board_id');
    table.index('list_id');
    table.index('creator_user_id');
    table.index('position');
    table.index('list_changed_at');
  }).raw(`
    CREATE INDEX card_name_index ON card USING GIN (name gin_trgm_ops);
    CREATE INDEX card_description_index ON card USING GIN (description gin_trgm_ops);
  `);

  await knex.schema.createTable('card_subscription', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.boolean('is_permanent').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['card_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('card_membership', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['card_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('card_label', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('label_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['card_id', 'label_id']);
    table.index('label_id');
  });

  await knex.schema.createTable('task_list', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();

    table.specificType('position', 'double precision').notNullable();
    table.text('name').notNullable();
    table.boolean('show_on_front_of_card').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('card_id');
    table.index('position');
  });

  await knex.schema.createTable('task', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('task_list_id').notNullable();
    table.bigInteger('assignee_user_id');

    table.specificType('position', 'double precision').notNullable();
    table.text('name').notNullable();
    table.boolean('is_completed').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('task_list_id');
    table.index('assignee_user_id');
    table.index('position');
  });

  await knex.schema.createTable('attachment', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('creator_user_id');

    table.text('type').notNullable();
    table.jsonb('data').notNullable();
    table.text('name').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('card_id');
    table.index('creator_user_id');
  });

  await knex.schema.createTable('custom_field_group', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id');
    table.bigInteger('card_id');
    table.bigInteger('base_custom_field_group_id');

    table.specificType('position', 'double precision').notNullable();
    table.text('name');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_id');
    table.index('card_id');
    table.index('base_custom_field_group_id');
    table.index('position');
  });

  await knex.schema.createTable('custom_field', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('base_custom_field_group_id');
    table.bigInteger('custom_field_group_id');

    table.specificType('position', 'double precision').notNullable();
    table.text('name').notNullable();
    table.boolean('show_on_front_of_card').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('base_custom_field_group_id');
    table.index('custom_field_group_id');
    table.index('position');
  });

  await knex.schema.createTable('custom_field_value', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('custom_field_group_id').notNullable();
    table.bigInteger('custom_field_id').notNullable();

    table.text('content').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['card_id', 'custom_field_group_id', 'custom_field_id']);
    table.index('custom_field_group_id');
    table.index('custom_field_id');
  });

  await knex.schema.createTable('comment', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('user_id');

    table.text('text').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('card_id');
    table.index('user_id');
  });

  await knex.schema.createTable('action', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('card_id').notNullable();
    table.bigInteger('user_id');

    table.text('type').notNullable();
    table.jsonb('data').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('card_id');
    table.index('user_id');
  });

  await knex.schema.createTable('notification', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id').notNullable();
    table.bigInteger('creator_user_id');
    table.bigInteger('board_id').notNullable();
    table.bigInteger('card_id').notNullable();
    table.bigInteger('comment_id');
    table.bigInteger('action_id');

    table.text('type').notNullable();
    table.jsonb('data').notNullable();
    table.boolean('is_read').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('user_id');
    table.index('creator_user_id');
    table.index('card_id');
    table.index('comment_id');
    table.index('action_id');
    table.index('is_read');
  });

  return knex.schema.createTable('notification_service', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id');
    table.bigInteger('board_id');

    table.text('url').notNullable();
    table.text('format').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('user_id');
    table.index('board_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('file_reference');
  await knex.schema.dropTable('user_account');
  await knex.schema.dropTable('identity_provider_user');
  await knex.schema.dropTable('session');
  await knex.schema.dropTable('project');
  await knex.schema.dropTable('project_favorite');
  await knex.schema.dropTable('project_manager');
  await knex.schema.dropTable('background_image');
  await knex.schema.dropTable('base_custom_field_group');
  await knex.schema.dropTable('board');
  await knex.schema.dropTable('board_subscription');
  await knex.schema.dropTable('board_membership');
  await knex.schema.dropTable('label');
  await knex.schema.dropTable('list');
  await knex.schema.dropTable('card');
  await knex.schema.dropTable('card_subscription');
  await knex.schema.dropTable('card_membership');
  await knex.schema.dropTable('card_label');
  await knex.schema.dropTable('task_list');
  await knex.schema.dropTable('task');
  await knex.schema.dropTable('attachment');
  await knex.schema.dropTable('custom_field_group');
  await knex.schema.dropTable('custom_field');
  await knex.schema.dropTable('custom_field_value');
  await knex.schema.dropTable('comment');
  await knex.schema.dropTable('action');
  await knex.schema.dropTable('notification');
  await knex.schema.dropTable('notification_service');

  return knex.raw(`
    DROP EXTENSION pg_trgm;

    DROP SEQUENCE next_id_seq;
    DROP FUNCTION next_id(OUT id BIGINT);
  `);
};
