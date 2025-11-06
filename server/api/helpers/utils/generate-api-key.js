/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  fn() {
    const prefix = sails.helpers.utils.generateRandomString(8);
    const secret = sails.helpers.utils.generateRandomString(32);
    const key = `${prefix}_${secret}`;

    return {
      key,
      prefix,
    };
  },
};
