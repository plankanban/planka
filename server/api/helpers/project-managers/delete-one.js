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
    user: {
      type: 'ref',
      required: true,
    },
    project: {
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
    mustNotBeLast: {},
  },

  async fn(inputs) {
    const projectManagersLeft = await sails.helpers.projects.getProjectManagersTotalById(
      inputs.project.id,
      inputs.record.id,
    );

    if (projectManagersLeft === 0) {
      throw 'mustNotBeLast';
    }

    const scoper = await sails.helpers.projects.makeScoper.with({
      record: inputs.project,
    });

    await scoper.getProjectManagerUserIds();

    const projectManager = await ProjectManager.qm.deleteOne(inputs.record.id);

    if (projectManager) {
      if (inputs.user.role !== User.Roles.ADMIN || inputs.project.ownerProjectManagerId) {
        const boardIds = await sails.helpers.projects.getBoardIdsById(projectManager.projectId);
        const boardMemberships = await scoper.getBoardMembershipsForWholeProject();

        const membershipBoardIds = boardMemberships.reduce((result, boardMembership) => {
          if (boardMembership.userId !== projectManager.userId) {
            return result;
          }

          result.push(boardMembership.boardId);
          return result;
        }, []);

        const missingBoardIds = _.difference(boardIds, membershipBoardIds);

        missingBoardIds.forEach((boardId) => {
          sails.sockets.removeRoomMembersFromRooms(
            `@user:${projectManager.userId}`,
            `board:${boardId}`,
          );
        });
      }

      const projectRelatedUserIds = await scoper.getProjectRelatedUserIds();

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectManagerDelete',
          {
            item: projectManager,
          },
          inputs.request,
        );
      });

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.PROJECT_MANAGER_DELETE,
        buildData: () => ({
          item: projectManager,
          included: {
            users: [sails.helpers.users.presentOne(inputs.user)],
            projects: [inputs.project],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return projectManager;
  },
};
