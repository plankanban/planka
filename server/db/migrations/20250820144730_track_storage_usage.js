/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const mime = require('mime');

exports.up = async (knex) => {
  await knex.schema.createTable('storage_usage', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('total').notNullable();
    table.bigInteger('user_avatars').notNullable();
    table.bigInteger('background_images').notNullable();
    table.bigInteger('attachments').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
  });

  await knex.schema.alterTable('file_reference', (table) => {
    table.dropPrimary();
    table.dropIndex('total');
  });

  await knex.schema.renameTable('file_reference', 'uploaded_file');

  await knex.schema.alterTable('uploaded_file', (table) => {
    /* Columns */

    table.text('type').notNullable().defaultTo('attachment');
    table.text('mime_type');
    table.bigInteger('size').notNullable().defaultTo(0);

    /* Modifications */

    table.text('id').primary().defaultTo(knex.raw('next_id()')).alter();
    table.renameColumn('total', 'references_total');

    /* Indexes */

    table.index('type');
    table.index('references_total');
  });

  await knex.schema.alterTable('uploaded_file', (table) => {
    table.text('type').notNullable().alter();
    table.bigInteger('size').notNullable().alter();
  });

  await knex.raw(`
    UPDATE user_account
    SET avatar = avatar - 'dirname' - 'sizeInBytes' || jsonb_build_object('uploadedFileId', avatar->'dirname', 'size', avatar->'sizeInBytes')
    WHERE avatar IS NOT NULL;
  `);

  await knex.schema.alterTable('background_image', (table) => {
    table.renameColumn('dirname', 'uploaded_file_id');
    table.renameColumn('size_in_bytes', 'size');
  });

  await knex.raw(`
    UPDATE attachment
    SET data = data - 'fileReferenceId' - 'sizeInBytes' || jsonb_build_object('uploadedFileId', data->'fileReferenceId', 'size', data->'sizeInBytes')
    WHERE type = 'file';
  `);

  await knex.raw(`
    UPDATE uploaded_file
    SET
      type = 'attachment',
      mime_type = attachment.data->>'mimeType',
      size = (attachment.data->>'size')::bigint
    FROM attachment
    WHERE (attachment.data->>'uploadedFileId')::text = uploaded_file.id AND attachment.type = 'file';
  `);

  const users = await knex('user_account').whereNotNull('avatar');
  const createdAt = new Date().toISOString();

  await knex.batchInsert(
    'uploaded_file',
    users.map(({ avatar }) => ({
      createdAt,
      id: avatar.uploadedFileId,
      type: 'userAvatar',
      referencesTotal: 1,
      mimeType: mime.getType(avatar.extension),
      size: avatar.size,
    })),
  );

  const backgroundImages = await knex('background_image');

  await knex.batchInsert(
    'uploaded_file',
    backgroundImages.map((backgroundImage) => ({
      id: backgroundImage.uploaded_file_id,
      type: 'backgroundImage',
      referencesTotal: 1,
      mimeType: mime.getType(backgroundImage.extension),
      size: backgroundImage.size,
      createdAt: backgroundImage.created_at,
    })),
  );

  return knex.raw(`
    INSERT INTO storage_usage (id, total, user_avatars, background_images, attachments, created_at)
    SELECT
      1 AS id,
      COALESCE(SUM(size), 0) AS total,
      COALESCE(SUM(CASE WHEN type = 'userAvatar' THEN size ELSE 0 END), 0) AS user_avatars,
      COALESCE(SUM(CASE WHEN type = 'backgroundImage' THEN size ELSE 0 END), 0) AS background_images,
      COALESCE(SUM(CASE WHEN type = 'attachment' THEN size ELSE 0 END), 0) AS attachments,
      timezone('UTC', now()) AS created_at
    FROM uploaded_file;
  `);
};

exports.down = async (knex) => {
  await knex.schema.dropTable('storage_usage');

  await knex('uploaded_file').delete().whereNot('type', 'attachment');

  await knex.schema.alterTable('uploaded_file', (table) => {
    table.dropPrimary();
    table.dropIndex('references_total');
  });

  await knex.schema.renameTable('uploaded_file', 'file_reference');

  await knex.schema.alterTable('file_reference', (table) => {
    table.dropColumn('type');
    table.dropColumn('mime_type');
    table.dropColumn('size');

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()')).alter();
    table.renameColumn('references_total', 'total');

    table.index('total');
  });

  await knex.raw(`
    UPDATE user_account
    SET avatar = avatar - 'uploadedFileId' - 'size' || jsonb_build_object('dirname', avatar->'uploadedFileId', 'sizeInBytes', avatar->'size')
    WHERE avatar IS NOT NULL;
  `);

  await knex.schema.alterTable('background_image', (table) => {
    table.renameColumn('uploaded_file_id', 'dirname');
    table.renameColumn('size', 'size_in_bytes');
  });

  return knex.raw(`
    UPDATE attachment
    SET data = data - 'uploadedFileId' - 'size' || jsonb_build_object('fileReferenceId', data->'uploadedFileId', 'sizeInBytes', data->'size')
    WHERE type = 'file';
  `);
};
