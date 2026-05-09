/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
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

  exits: {
    mappingAlreadyExists: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    let mapping;
    try {
      mapping = await ProjectGroupMapping.qm.createOne({
        groupName: values.groupName,
        projectId: values.project.id,
      });
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'mappingAlreadyExists';
      }

      throw error;
    }

    const adminUsers = await User.qm.getAll({
      roleOrRoles: User.Roles.ADMIN,
      isDeactivated: false,
    });

    adminUsers.forEach((adminUser) => {
      sails.sockets.broadcast(
        `user:${adminUser.id}`,
        'projectGroupMappingCreate',
        {
          item: mapping,
        },
        inputs.request,
      );
    });

    return mapping;
  },
};
