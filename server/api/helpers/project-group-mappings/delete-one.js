/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const mapping = await ProjectGroupMapping.qm.deleteOne(inputs.record.id);

    if (mapping) {
      const adminUsers = await User.qm.getAll({
        roleOrRoles: User.Roles.ADMIN,
        isDeactivated: false,
      });

      adminUsers.forEach((adminUser) => {
        sails.sockets.broadcast(
          `user:${adminUser.id}`,
          'projectGroupMappingDelete',
          {
            item: mapping,
          },
          inputs.request,
        );
      });
    }

    return mapping;
  },
};
