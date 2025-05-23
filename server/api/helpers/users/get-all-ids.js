/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    roleOrRoles: {
      type: 'json',
    },
  },

  async fn(inputs) {
    const users = await User.qm.getAll({
      roleOrRoles: inputs.roleOrRoles,
    });

    return sails.helpers.utils.mapRecords(users);
  },
};
