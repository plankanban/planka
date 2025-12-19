/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { v4: uuid } = require('uuid');
const { rimraf } = require('rimraf');
const { fileTypeFromFile } = require('file-type');
const sharp = require('sharp');

const { MAX_SIZE_TO_PROCESS_AS_IMAGE } = require('../../../constants');

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
    const fileManager = sails.hooks['file-manager'].getInstance();

    const fileType = await fileTypeFromFile(inputs.file.fd);
    const { mime: mimeType = null } = fileType || {};
    const { size } = inputs.file;

    if (!mimeType || !mimeType.startsWith('image/') || size > MAX_SIZE_TO_PROCESS_AS_IMAGE) {
      await rimraf(inputs.file.fd);
      throw 'fileIsNotImage';
    }

    let image = sharp(inputs.file.fd, {
      animated: true,
    });

    let metadata;
    let originalBuffer;

    try {
      metadata = await image.metadata();

      if (metadata.orientation && metadata.orientation > 4) {
        image = image.rotate();
      }

      originalBuffer = await image.toBuffer();
    } catch (error) {
      await rimraf(inputs.file.fd);
      throw 'fileIsNotImage';
    }

    const { id: uploadedFileId } = await UploadedFile.qm.createOne({
      mimeType,
      size,
      id: uuid(),
      type: UploadedFile.Types.BACKGROUND_IMAGE,
    });

    const dirPathSegment = `${sails.config.custom.backgroundImagesPathSegment}/${uploadedFileId}`;
    const extension = metadata.format === 'jpeg' ? 'jpg' : metadata.format;

    try {
      await fileManager.save(
        `${dirPathSegment}/original.${extension}`,
        originalBuffer,
        inputs.file.type,
      );

      const outside360Buffer = await image
        .resize(360, 360, {
          fit: 'outside',
          withoutEnlargement: true,
        })
        .png({
          quality: 75,
          force: false,
        })
        .toBuffer();

      await fileManager.save(
        `${dirPathSegment}/outside-360.${extension}`,
        outside360Buffer,
        inputs.file.type,
      );
    } catch (error) {
      sails.log.warn(error.stack);

      await fileManager.deleteDir(dirPathSegment);
      await rimraf(inputs.file.fd);
      await UploadedFile.qm.deleteOne(uploadedFileId);

      throw 'fileIsNotImage';
    }

    await rimraf(inputs.file.fd);

    return {
      uploadedFileId,
      extension,
      size,
    };
  },
};
