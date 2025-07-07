/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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
    emailAlreadyInUse: {},
    usernameAlreadyInUse: {},
    activeLimitReached: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (!_.isUndefined(values.email)) {
      values.email = values.email.toLowerCase();
    }

    let isOnlyEmailChange = false;
    let isOnlyPasswordChange = false;
    let isOnlyPersonalFieldsChange = false;
    let isDeactivatedChangeToTrue = false;

    if (!_.isUndefined(values.email) && Object.keys(values).length === 1) {
      isOnlyEmailChange = true;
    }

    if (_.difference(Object.keys(values), User.PERSONAL_FIELD_NAMES).length === 0) {
      isOnlyPersonalFieldsChange = true;
    }

    if (!_.isUndefined(values.password)) {
      if (Object.keys(values).length === 1) {
        isOnlyPasswordChange = true;
      }

      values.password = await bcrypt.hash(values.password, 10);
      values.passwordChangedAt = new Date().toUTCString(); // FIXME: hack
    }

    if (values.username) {
      values.username = values.username.toLowerCase();
    }

    if (values.isDeactivated && values.isDeactivated !== inputs.record.isDeactivated) {
      isDeactivatedChangeToTrue = true;
    }

    let user;
    try {
      user = await User.qm.updateOne(inputs.record.id, values);
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'emailAlreadyInUse';
      }

      if (
        error.name === 'AdapterError' &&
        error.raw.constraint === 'user_account_username_unique'
      ) {
        throw 'usernameAlreadyInUse';
      }

      if (error.message === 'activeLimitReached') {
        throw 'activeLimitReached';
      }

      throw error;
    }

    if (user) {
      if (inputs.record.avatar) {
        if (!user.avatar || user.avatar.dirname !== inputs.record.avatar.dirname) {
          sails.helpers.users.removeRelatedFiles(inputs.record);
        }
      }

      if (!_.isUndefined(values.password) || isDeactivatedChangeToTrue) {
        sails.sockets.broadcast(
          `user:${user.id}`,
          'userDelete', // TODO: introduce separate event
          {
            item: sails.helpers.users.presentOne(user, user),
          },
          inputs.request,
        );

        if (
          !isDeactivatedChangeToTrue &&
          user.id === inputs.actorUser.id &&
          inputs.request &&
          inputs.request.isSocket
        ) {
          const tempRoom = uuid();

          sails.sockets.addRoomMembersToRooms(`@user:${user.id}`, tempRoom, () => {
            sails.sockets.leave(inputs.request, tempRoom, () => {
              sails.sockets.leaveAll(tempRoom);
            });
          });
        } else {
          sails.sockets.leaveAll(`@user:${user.id}`);
        }
      }

      if (!isOnlyPasswordChange) {
        if (isOnlyPersonalFieldsChange) {
          sails.sockets.broadcast(
            `user:${user.id}`,
            'userUpdate',
            {
              item: sails.helpers.users.presentOne(user, user),
            },
            inputs.request,
          );
        } else {
          const scoper = sails.helpers.users.makeScoper(user);
          const privateUserRelatedUserIds = await scoper.getPrivateUserRelatedUserIds();

          privateUserRelatedUserIds.forEach((userId) => {
            sails.sockets.broadcast(
              `user:${userId}`,
              'userUpdate',
              {
                // FIXME: hack
                item: sails.helpers.users.presentOne(user, {
                  id: userId,
                  role: User.Roles.ADMIN,
                }),
              },
              inputs.request,
            );
          });

          if (!isOnlyEmailChange) {
            if (inputs.record.role === User.Roles.ADMIN && user.role !== User.Roles.ADMIN) {
              const managerProjectIds = await sails.helpers.users.getManagerProjectIds(user.id);

              const sharedProjects = await Project.qm.getShared({
                exceptIdOrIds: managerProjectIds,
              });

              const projectIds = sails.helpers.utils.mapRecords(sharedProjects);

              const boards = await Board.qm.getByProjectIds(projectIds);
              const boardIds = sails.helpers.utils.mapRecords(boards);

              const boardMemberships = await BoardMembership.qm.getByBoardIdsAndUserId(
                boardIds,
                user.id,
              );

              const missingBoardIds = _.difference(
                boardIds,
                sails.helpers.utils.mapRecords(boardMemberships, 'boardId'),
              );

              missingBoardIds.forEach((boardId) => {
                sails.sockets.removeRoomMembersFromRooms(`@user:${user.id}`, `board:${boardId}`);
              });
            }

            const publicUserRelatedUserIds = await scoper.getPublicUserRelatedUserIds();

            publicUserRelatedUserIds.forEach((userId) => {
              sails.sockets.broadcast(
                `user:${userId}`,
                'userUpdate',
                {
                  // FIXME: hack
                  item: sails.helpers.users.presentOne(user, {
                    id: userId,
                  }),
                },
                inputs.request,
              );
            });
          }
        }

        const webhooks = await Webhook.qm.getAll();

        sails.helpers.utils.sendWebhooks.with({
          webhooks,
          event: Webhook.Events.USER_UPDATE,
          buildData: () => ({
            item: sails.helpers.users.presentOne(user),
          }),
          buildPrevData: () => ({
            item: sails.helpers.users.presentOne(inputs.record),
          }),
          user: inputs.actorUser,
        });
      }
    }

    return user;
  },
};
