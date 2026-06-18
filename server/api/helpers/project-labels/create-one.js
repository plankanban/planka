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
    project: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    webhooks: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const projectLabels = await ProjectLabel.qm.getByProjectId(values.project.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      projectLabels,
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const reposition of repositions) {
      // eslint-disable-next-line no-await-in-loop
      await ProjectLabel.qm.updateOne(
        {
          id: reposition.record.id,
          projectId: reposition.record.projectId,
        },
        {
          position: reposition.position,
        },
      );

      sails.sockets.broadcast(`project:${values.project.id}`, 'projectLabelUpdate', {
        item: {
          id: reposition.record.id,
          position: reposition.position,
        },
      });
    }

    const projectLabel = await ProjectLabel.qm.createOne({
      ...values,
      position,
      projectId: values.project.id,
    });

    // Sync to all boards in the project in real-time
    const boards = await Board.qm.getByProjectId(values.project.id);

    // eslint-disable-next-line no-restricted-syntax
    for (const board of boards) {
      // eslint-disable-next-line no-await-in-loop
      const syncedLabel = await Label.qm.createOne({
        position: projectLabel.position,
        name: projectLabel.name,
        color: projectLabel.color,
        boardId: board.id,
        projectLabelId: projectLabel.id,
      });

      sails.sockets.broadcast(`board:${board.id}`, 'labelCreate', {
        item: syncedLabel,
      });
    }

    sails.sockets.broadcast(
      `project:${projectLabel.projectId}`,
      'projectLabelCreate',
      {
        item: projectLabel,
      },
      inputs.request,
    );

    const { webhooks = await Webhook.qm.getAll() } = inputs;

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.PROJECT_LABEL_CREATE,
      buildData: () => ({
        item: projectLabel,
        included: {
          projects: [inputs.project],
        },
      }),
      user: inputs.actorUser,
    });

    return projectLabel;
  },
};
