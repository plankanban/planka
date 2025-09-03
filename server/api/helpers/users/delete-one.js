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
    const { projectManagers, boardMemberships } = await sails.helpers.users.deleteRelated(
      inputs.record,
    );

    const { user, uploadedFile } = await User.qm.deleteOne(inputs.record.id);

    if (user) {
      if (uploadedFile) {
        sails.helpers.utils.removeUnreferencedUploadedFiles(uploadedFile);
      }

      const scoper = sails.helpers.users.makeScoper(user);
      scoper.boardMemberships = boardMemberships;

      const privateUserRelatedUserIds = await scoper.getPrivateUserRelatedUserIds();

      privateUserRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'userDelete',
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

      const publicUserRelatedUserIds = await scoper.getPublicUserRelatedUserIds();

      publicUserRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'userDelete',
          {
            // FIXME: hack
            item: sails.helpers.users.presentOne(user, {
              id: userId,
            }),
          },
          inputs.request,
        );
      });

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.USER_DELETE,
        buildData: () => ({
          item: sails.helpers.users.presentOne(user),
        }),
        user: inputs.actorUser,
      });

      sails.sockets.leaveAll(`@user:${user.id}`);

      const projectIds = await sails.helpers.utils.mapRecords(projectManagers, 'projectId', true);
      const lonelyProjects = await sails.helpers.projects.getLonelyByIds(projectIds);

      await Promise.all(
        lonelyProjects.map((project) =>
          // TODO: optimize with scoper
          sails.helpers.projectManagers.createOne.with({
            webhooks,
            values: {
              project,
              user: inputs.actorUser,
            },
            actorUser: inputs.actorUser,
          }),
        ),
      );
    }

    return user;
  },
};
