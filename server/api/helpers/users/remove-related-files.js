/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    recordOrRecords: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    const users = _.isPlainObject(inputs.recordOrRecords)
      ? [inputs.recordOrRecords]
      : inputs.recordOrRecords;

    const fileManager = sails.hooks['file-manager'].getInstance();

    users.forEach(async (user) => {
      if (user.avatar) {
        await fileManager.deleteDir(
          `${sails.config.custom.userAvatarsPathSegment}/${user.avatar.dirname}`,
        );
      }
    });
  },
};
