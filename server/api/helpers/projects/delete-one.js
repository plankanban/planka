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

  exits: {
    mustNotHaveBoards: {},
  },

  async fn(inputs) {
    const boardsTotal = await sails.helpers.projects.getBoardsTotalById(inputs.record.id);

    if (boardsTotal > 0) {
      throw 'mustNotHaveBoards';
    }

    const { projectManagers } = await sails.helpers.projects.deleteRelated(inputs.record);
    const project = await Project.qm.deleteOne(inputs.record.id);

    if (project) {
      const scoper = sails.helpers.projects.makeScoper.with({
        record: project,
      });

      scoper.projectManagerUserIds = sails.helpers.utils.mapRecords(projectManagers, 'userId');
      const projectRelatedUserIds = await scoper.getProjectRelatedUserIds();

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectDelete',
          {
            item: project,
          },
          inputs.request,
        );
      });

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.PROJECT_DELETE,
        buildData: () => ({
          item: project,
        }),
        user: inputs.actorUser,
      });
    }

    return project;
  },
};
