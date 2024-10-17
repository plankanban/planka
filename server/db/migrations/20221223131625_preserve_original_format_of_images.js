const path = require('path');
const rimraf = require('rimraf');
const sharp = require('sharp');

const getConfig = require('../../get-config');

const migrateImage = async (knex, tableName, fieldName, prevFieldName) => {
  await knex.schema.table(tableName, (table) => {
    /* Columns */

    table.jsonb(fieldName);
  });

  await knex(tableName)
    .update({
      [fieldName]: knex.raw('format(\'{"dirname":"%s","extension":"jpg"}\', ??)::jsonb', [
        prevFieldName,
      ]),
    })
    .whereNotNull(prevFieldName);

  await knex.schema.table(tableName, (table) => {
    table.dropColumn(prevFieldName);
  });
};

const rollbackImage = async (knex, tableName, fieldName, prevFieldName) => {
  await knex.schema.table(tableName, (table) => {
    /* Columns */

    table.text(prevFieldName);
  });

  await knex(tableName)
    .update({
      [prevFieldName]: knex.raw("??->>'dirname'", [fieldName]),
    })
    .whereNotNull(fieldName);

  await knex.schema.table(tableName, (table) => {
    table.dropColumn(fieldName);
  });
};

const processAttachmentImage = async (attachment, attachmentsPath) => {
  const rootPath = path.join(attachmentsPath, attachment.dirname);
  const thumbnailsPath = path.join(rootPath, 'thumbnails');

  const image = sharp(path.join(rootPath, attachment.filename), {
    animated: true,
  });

  let metadata;
  try {
    metadata = await image.metadata();
  } catch (error) {
    return null;
  }

  const { width, pageHeight: height = metadata.height } = metadata;
  const thumbnailsExtension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;

  try {
    await image
      .resize(256, height > width ? 320 : undefined, {
        kernel: sharp.kernel.nearest,
      })
      .toFile(path.join(thumbnailsPath, `cover-256.${thumbnailsExtension}`));
  } catch (error) {
    return null;
  }

  if (thumbnailsExtension !== 'jpg') {
    try {
      rimraf.sync(path.join(thumbnailsPath, 'cover-256.jpg'));
    } catch (error) {
      console.warn(error.stack); // eslint-disable-line no-console
    }
  }

  return {
    width,
    height,
    thumbnailsExtension,
  };
};

module.exports.up = async (knex) => {
  await migrateImage(knex, 'user_account', 'avatar', 'avatar_dirname');
  await migrateImage(knex, 'project', 'background_image', 'background_image_dirname');

  const config = await getConfig();
  const attachments = await knex('attachment').whereNotNull('image');

  // eslint-disable-next-line no-restricted-syntax
  for (const attachment of attachments) {
    // eslint-disable-next-line no-await-in-loop
    const image = await processAttachmentImage(attachment, config.custom.attachmentsPath);

    // eslint-disable-next-line no-await-in-loop
    await knex('attachment')
      .update({
        image: image || knex.raw('?? || \'{"thumbnailsExtension":"jpg"}\'', ['image']),
      })
      .where('id', attachment.id);
  }
};

module.exports.down = async (knex) => {
  await rollbackImage(knex, 'user_account', 'avatar', 'avatar_dirname');
  await rollbackImage(knex, 'project', 'background_image', 'background_image_dirname');

  return knex('attachment')
    .update({
      image: knex.raw("?? - 'thumbnailsExtension'", ['image']),
    })
    .whereNotNull('image');
};
