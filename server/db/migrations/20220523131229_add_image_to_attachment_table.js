const path = require('path');
const sharp = require('sharp');
const _ = require('lodash');

const getConfig = require('../../get-config');

module.exports.up = async (knex) => {
  await knex.schema.table('attachment', (table) => {
    /* Columns */

    table.jsonb('image');
  });

  const config = await getConfig();
  const attachments = await knex('attachment');

  // eslint-disable-next-line no-restricted-syntax
  for (const attachment of attachments) {
    if (attachment.is_image) {
      const image = sharp(
        path.join(config.custom.attachmentsPath, attachment.dirname, attachment.filename),
      );

      let metadata;
      try {
        metadata = await image.metadata(); // eslint-disable-line no-await-in-loop
      } catch (error) {
        continue; // eslint-disable-line no-continue
      }

      if (!['svg', 'pdf'].includes(metadata.format)) {
        // eslint-disable-next-line no-await-in-loop
        await knex('attachment')
          .update({
            image: _.pick(metadata, ['width', 'height']),
          })
          .where('id', attachment.id);
      }
    }
  }

  return knex.schema.table('attachment', (table) => {
    table.dropColumn('is_image');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.table('attachment', (table) => {
    /* Columns */

    table.boolean('is_image');
  });

  const attachments = await knex('attachment');

  // eslint-disable-next-line no-restricted-syntax
  for (const attachment of attachments) {
    // eslint-disable-next-line no-await-in-loop
    await knex('attachment')
      .update({
        is_image: !!attachment.image,
      })
      .where('id', attachment.id);
  }

  return knex.schema.table('attachment', (table) => {
    table.dropColumn('image');

    table.dropNullable('is_image');
  });
};
