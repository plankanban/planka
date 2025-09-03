/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    const fileManager = sails.hooks['file-manager'].getInstance();

    return {
      ..._.omit(inputs.record, ['uploadedFileId', 'extension']),
      url: `${fileManager.buildUrl(`${sails.config.custom.backgroundImagesPathSegment}/${inputs.record.uploadedFileId}/original.${inputs.record.extension}`)}`,
      thumbnailUrls: {
        outside360: `${fileManager.buildUrl(`${sails.config.custom.backgroundImagesPathSegment}/${inputs.record.uploadedFileId}/outside-360.${inputs.record.extension}`)}`,
      },
    };
  },
};
