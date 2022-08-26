const fs = require('fs');
const path = require('path');
const util = require('util');
const rimraf = require('rimraf');
const filenamify = require('filenamify');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');

const rename = util.promisify(fs.rename);

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const dirname = uuid();

    // FIXME: https://github.com/sindresorhus/filenamify/issues/13
    const filename = filenamify(inputs.file.filename);

    const rootPath = path.join(sails.config.custom.attachmentsPath, dirname);
    const filePath = path.join(rootPath, filename);

    fs.mkdirSync(rootPath);
    await rename(inputs.file.fd, filePath);

    const image = sharp(filePath);
    let metadata;

    try {
      metadata = await image.metadata();
    } catch (error) {} // eslint-disable-line no-empty

    const fileData = {
      dirname,
      filename,
      image: null,
      name: inputs.file.filename,
    };

    if (metadata && !['svg', 'pdf'].includes(metadata.format)) {
      const thumbnailsPath = path.join(rootPath, 'thumbnails');
      fs.mkdirSync(thumbnailsPath);

      try {
        await image
          .resize(
            metadata.height > metadata.width
              ? {
                  width: 256,
                  height: 320,
                }
              : {
                  width: 256,
                },
          )
          .jpeg({
            quality: 100,
            chromaSubsampling: '4:4:4',
          })
          .toFile(path.join(thumbnailsPath, 'cover-256.jpg'));

        fileData.image = _.pick(metadata, ['width', 'height']);
      } catch (error1) {
        try {
          rimraf.sync(thumbnailsPath);
        } catch (error2) {
          console.warn(error2.stack); // eslint-disable-line no-console
        }
      }
    }

    return fileData;
  },
};
