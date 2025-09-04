/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const util = require('util');

module.exports = {
  inputs: {
    file: {
      type: 'ref',
      required: true,
    },
    enforceStorageLimit: {
      type: 'boolean',
      defaultsTo: true,
    },
  },

  async fn(inputs, exits) {
    const { maxUploadFileSize } = sails.config.custom;

    let availableStorage = null;
    if (inputs.enforceStorageLimit) {
      availableStorage = await sails.helpers.utils.getAvailableStorage();
    }

    let maxBytes = maxUploadFileSize;
    if (availableStorage !== null) {
      if (maxBytes) {
        maxBytes = availableStorage < maxBytes ? availableStorage : maxBytes;
      } else {
        maxBytes = availableStorage;
      }
    }

    const upload = util.promisify((options, callback) =>
      inputs.file.upload(options, (error, files) => {
        if (
          error &&
          error.code === 'E_EXCEEDS_UPLOAD_LIMIT' &&
          availableStorage !== null &&
          (maxUploadFileSize === null || error.maxBytes < maxUploadFileSize)
        ) {
          return callback(new Error('Storage limit reached'), files);
        }

        return callback(error, files);
      }),
    );

    return exits.success(
      await upload({
        maxBytes,
        dirname: sails.config.custom.uploadsTempPath,
      }),
    );
  },
};
