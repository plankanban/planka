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

  async fn(inputs) {
    // Clean up synced board labels first
    const syncedLabels = await Label.find({ projectLabelId: inputs.record.id });

    // eslint-disable-next-line no-restricted-syntax
    for (const syncedLabel of syncedLabels) {
      // eslint-disable-next-line no-await-in-loop
      await sails.helpers.labels.deleteRelated(syncedLabel);
      // eslint-disable-next-line no-await-in-loop
      await Label.qm.deleteOne(syncedLabel.id);

      sails.sockets.broadcast(`board:${syncedLabel.boardId}`, 'labelDelete', {
        item: syncedLabel,
      });
    }

    const projectLabel = await ProjectLabel.qm.deleteOne(inputs.record.id);

    if (projectLabel) {
      sails.sockets.broadcast(
        `project:${projectLabel.projectId}`,
        'projectLabelDelete',
        {
          item: projectLabel,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.PROJECT_LABEL_DELETE,
        buildData: () => ({
          item: projectLabel,
          included: {
            projects: [inputs.project],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return projectLabel;
  },
};
