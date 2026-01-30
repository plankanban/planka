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
    return {
      ..._.omit(inputs.record, ['uploadedFileId', 'extension']),
      url: `${sails.config.custom.baseUrl}/background-images/${inputs.record.uploadedFileId}/original.${inputs.record.extension}`,
      thumbnailUrls: {
        outside360: `${sails.config.custom.baseUrl}/background-images/${inputs.record.uploadedFileId}/outside-360.${inputs.record.extension}`,
      },
    };
  },
};
