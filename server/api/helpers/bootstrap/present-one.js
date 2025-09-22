/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    oidc: {
      type: 'ref',
    },
    user: {
      type: 'ref',
    },
  },

  fn(inputs) {
    const data = {
      oidc: inputs.oidc,
      version: sails.config.custom.version,
    };
    if (inputs.user && inputs.user.role === User.Roles.ADMIN) {
      data.activeUsersLimit = sails.config.custom.activeUsersLimit;
    }

    return data;
  },
};
