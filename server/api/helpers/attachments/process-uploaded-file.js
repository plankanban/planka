const { rimraf } = require('rimraf');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');

const filenamify = require('../../../utils/filenamify');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const fileManager = sails.hooks['file-manager'].getInstance();

    const dirname = uuid();
    const dirPathSegment = `${sails.config.custom.attachmentsPathSegment}/${dirname}`;
    const filename = filenamify(inputs.file.filename);

    const filePath = await fileManager.move(
      inputs.file.fd,
      `${dirPathSegment}/${filename}`,
      inputs.file.type,
    );

    let image = sharp(filePath || inputs.file.fd, {
      animated: true,
    });

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
      let { width, pageHeight: height = metadata.height } = metadata;
      if (metadata.orientation && metadata.orientation > 4) {
        [image, width, height] = [image.rotate(), height, width];
      }

      const isPortrait = height > width;
      const thumbnailsExtension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;

      try {
        const resizeBuffer = await image
          .resize(
            256,
            isPortrait ? 320 : undefined,
            width < 256 || (isPortrait && height < 320)
              ? {
                  kernel: sharp.kernel.nearest,
                }
              : undefined,
          )
          .toBuffer();

        await fileManager.save(
          `${dirPathSegment}/thumbnails/cover-256.${thumbnailsExtension}`,
          resizeBuffer,
          inputs.file.type,
        );

        fileData.image = {
          width,
          height,
          thumbnailsExtension,
        };
      } catch (error) {
        console.warn(error.stack); // eslint-disable-line no-console
      }
    }

    if (!filePath) {
      try {
        await rimraf(inputs.file.fd);
      } catch (error) {
        console.warn(error.stack); // eslint-disable-line no-console
      }
    }

    return fileData;
  },
};
