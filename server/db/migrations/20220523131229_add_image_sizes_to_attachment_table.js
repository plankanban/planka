const path = require('path');
const sharp = require('sharp');

const getConfig = require('../../get-config');

module.exports.up = async (knex) => {
  await knex.schema.table('attachment', (table) => {
    /* Columns */

    table.integer('image_width');
    table.integer('image_height');
  });

  const config = await getConfig();
  const attachments = await knex('attachment');

  // eslint-disable-next-line no-restricted-syntax
  for (attachment of attachments) {
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

      // eslint-disable-next-line no-await-in-loop
      await knex('attachment')
        .update({
          image_width: metadata.width,
          image_height: metadata.height,
        })
        .where('id', attachment.id);
    }
  }
};

module.exports.down = (knex) =>
  knex.schema.table('attachment', (table) => {
    table.dropColumns('image_width', 'image_height');
  });
