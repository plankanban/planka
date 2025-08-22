/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { Types } = require('../../models/UploadedFile');

const PATH_SEGMENT_BY_TYPE = {
  [Types.USER_AVATAR]: sails.config.custom.userAvatarsPathSegment,
  [Types.BACKGROUND_IMAGE]: sails.config.custom.backgroundImagesPathSegment,
  [Types.ATTACHMENT]: sails.config.custom.attachmentsPathSegment,
};

module.exports = {
  sync: true,

  inputs: {
    uploadedFileOrUploadedFiles: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    const uploadedFiles = _.isPlainObject(inputs.uploadedFileOrUploadedFiles)
      ? [inputs.uploadedFileOrUploadedFiles]
      : inputs.uploadedFileOrUploadedFiles;

    const fileManager = sails.hooks['file-manager'].getInstance();

    // TODO: optimize?
    uploadedFiles.forEach(async (uploadedFile) => {
      if (uploadedFile.referencesTotal !== null) {
        return;
      }

      await fileManager.deleteDir(`${PATH_SEGMENT_BY_TYPE[uploadedFile.type]}/${uploadedFile.id}`);
      await UploadedFile.qm.deleteOne(uploadedFile.id);
    });
  },
};
