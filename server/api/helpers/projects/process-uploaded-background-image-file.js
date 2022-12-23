const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    fileIsNotImage: {},
  },

  async fn(inputs) {
    const image = sharp(inputs.file.fd, {
      animated: true,
    });

    let metadata;
    try {
      metadata = await image.metadata();
    } catch (error) {
      throw 'fileIsNotImage';
    }

    if (['svg', 'pdf'].includes(metadata.format)) {
      throw 'fileIsNotImage';
    }

    const dirname = uuid();
    const rootPath = path.join(sails.config.custom.projectBackgroundImagesPath, dirname);

    fs.mkdirSync(rootPath);

    const extension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;

    try {
      await image.toFile(path.join(rootPath, `original.${extension}`));

      await image
        .resize(336, 200, {
          kernel: sharp.kernel.nearest,
        })
        .toFile(path.join(rootPath, `cover-336.${extension}`));
    } catch (error1) {
      try {
        rimraf.sync(rootPath);
      } catch (error2) {
        console.warn(error2.stack); // eslint-disable-line no-console
      }

      throw 'fileIsNotImage';
    }

    try {
      rimraf.sync(inputs.file.fd);
    } catch (error) {
      console.warn(error.stack); // eslint-disable-line no-console
    }

    return {
      dirname,
      extension,
    };
  },
};
