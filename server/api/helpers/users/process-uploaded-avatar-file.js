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
    let image = sharp(inputs.file.fd, {
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

    let { width, pageHeight: height = metadata.height } = metadata;
    if (metadata.orientation && metadata.orientation > 4) {
      [image, width, height] = [image.rotate(), height, width];
    }

    const extension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;

    if (sails.config.custom.s3Config) {
      const client = await sails.helpers.utils.getSimpleStorageServiceClient();
      let originalUrl = '';
      let squareUrl = '';

      try {
        const s3Original = await client.upload({
          Body: await image.toBuffer(),
          Key: `user-avatars/${dirname}/original.${extension}`,
          ContentType: inputs.file.type,
        });
        originalUrl = s3Original.Location;

        const resizeBuffer = await image
          .resize(
            100,
            100,
            width < 100 || height < 100
              ? {
                  kernel: sharp.kernel.nearest,
                }
              : undefined,
          )
          .toBuffer();
        const s3Square = await client.upload({
          Body: resizeBuffer,
          Key: `user-avatars/${dirname}/square-100.${extension}`,
          ContentType: inputs.file.type,
        });
        squareUrl = s3Square.Location;
      } catch (error1) {
        try {
          client.delete({ Key: `user-avatars/${dirname}/original.${extension}` });
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
        original: originalUrl,
        square: squareUrl,
      };
    }

    const rootPath = path.join(sails.config.custom.userAvatarsPath, dirname);

    fs.mkdirSync(rootPath);

    try {
      await image.toFile(path.join(rootPath, `original.${extension}`));

      await image
        .resize(
          100,
          100,
          width < 100 || height < 100
            ? {
                kernel: sharp.kernel.nearest,
              }
            : undefined,
        )
        .toFile(path.join(rootPath, `square-100.${extension}`));
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
