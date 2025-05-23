/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    fileReferenceOrFileReferences: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    const fileReferences = _.isPlainObject(inputs.fileReferenceOrFileReferences)
      ? [inputs.fileReferenceOrFileReferences]
      : inputs.fileReferenceOrFileReferences;

    const fileManager = sails.hooks['file-manager'].getInstance();

    fileReferences.forEach(async (fileReference) => {
      if (fileReference.total !== null) {
        return;
      }

      await fileManager.deleteDir(
        `${sails.config.custom.attachmentsPathSegment}/${fileReference.id}`,
      );

      await FileReference.destroyOne(fileReference.id);
    });
  },
};
