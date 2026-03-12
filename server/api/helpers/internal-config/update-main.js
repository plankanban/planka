/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const { internalConfig, deactivatedUserIds, prev } =
      await InternalConfig.qm.updateOneMain(values);

    if (deactivatedUserIds) {
      deactivatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(`user:${userId}`, 'logout');
        sails.sockets.leaveAll(`@user:${userId}`);
      });
    }

    if (internalConfig.activeUsersLimit !== prev.activeUsersLimit) {
      let adminUserIds;
      if (deactivatedUserIds && deactivatedUserIds.length > 0) {
        const users = await User.qm.getAll({
          roleOrRoles: [User.Roles.ADMIN, User.Roles.PROJECT_OWNER],
          isDeactivated: false,
        });

        adminUserIds = users.flatMap((user) => {
          sails.sockets.broadcast(`user:${user.id}`, 'usersReset');

          return user.role === User.Roles.ADMIN ? user.id : [];
        });
      } else {
        adminUserIds = await sails.helpers.users.getAllActiveIds(User.Roles.ADMIN);
      }

      adminUserIds.forEach((userId) => {
        sails.sockets.broadcast(`user:${userId}`, 'bootstrapUpdate', {
          item: {
            activeUsersLimit: internalConfig.activeUsersLimit,
          },
        });
      });
    }

    return internalConfig;
  },
};
