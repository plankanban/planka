/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fsPromises = require('fs').promises;
const { rimraf } = require('rimraf');
const { fileTypeFromFile } = require('file-type');
const { getEncoding } = require('istextorbinary');
const sharp = require('sharp');

const filenamify = require('../../../utils/filenamify');
const { MAX_SIZE_TO_GET_ENCODING, MAX_SIZE_TO_PROCESS_AS_IMAGE } = require('../../../constants');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const fileManager = sails.hooks['file-manager'].getInstance();

    const filename = filenamify(inputs.file.filename);
    const fileType = await fileTypeFromFile(inputs.file.fd);
    const { mime: mimeType = null } = fileType || {};
    const { size } = inputs.file;

    const { id: uploadedFileId } = await UploadedFile.qm.createOne({
      mimeType,
      size,
      type: UploadedFile.Types.ATTACHMENT,
    });

    const dirPathSegment = `${sails.config.custom.attachmentsPathSegment}/${uploadedFileId}`;

    let buffer;
    let encoding = null;

    if (size <= MAX_SIZE_TO_GET_ENCODING) {
      try {
        buffer = await fsPromises.readFile(inputs.file.fd);
      } catch (error) {
        /* empty */
      }

      if (buffer) {
        encoding = getEncoding(buffer);
      }
    }

    const filePath = await fileManager.move(
      inputs.file.fd,
      `${dirPathSegment}/${filename}`,
      inputs.file.type,
    );

    const data = {
      uploadedFileId,
      filename,
      mimeType,
      size,
      encoding,
      image: null,
    };

    if (mimeType && mimeType.startsWith('image/') && size <= MAX_SIZE_TO_PROCESS_AS_IMAGE) {
      let image = sharp(buffer || filePath || inputs.file.fd, {
        animated: true,
      });

      let metadata;
      try {
        metadata = await image.metadata();
      } catch (error) {
        /* empty */
      }

      if (metadata) {
        let { width, pageHeight: height = metadata.height } = metadata;
        if (metadata.orientation && metadata.orientation > 4) {
          [image, width, height] = [image.rotate(), height, width];
        }

        const thumbnailsPathSegment = `${dirPathSegment}/thumbnails`;
        const thumbnailsExtension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;

        const outside360 = image
          .clone()
          .resize(360, 360, {
            fit: 'outside',
            withoutEnlargement: true,
          })
          .png({
            quality: 75,
            force: false,
          });

        const outside720 = image
          .clone()
          .resize(720, 720, {
            fit: 'outside',
            withoutEnlargement: true,
          })
          .png({
            quality: 75,
            force: false,
          });

        try {
          await Promise.all([
            fileManager.save(
              `${thumbnailsPathSegment}/outside-360.${thumbnailsExtension}`,
              outside360,
              inputs.file.type,
            ),
            fileManager.save(
              `${thumbnailsPathSegment}/outside-720.${thumbnailsExtension}`,
              outside720,
              inputs.file.type,
            ),
          ]);

          data.image = {
            width,
            height,
            thumbnailsExtension,
          };
        } catch (error) {
          sails.log.warn(error.stack);
          await fileManager.deleteDir(thumbnailsPathSegment);
        }
      }
    }

    if (!filePath) {
      await rimraf(inputs.file.fd);
    }

    return data;
  },
};
