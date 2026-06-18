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
    values: {
      type: 'json',
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
    const { values } = inputs;

    if (!_.isUndefined(values.position)) {
      const projectLabels = await ProjectLabel.qm.getByProjectId(inputs.record.projectId, {
        exceptIdOrIds: inputs.record.id,
      });

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        projectLabels,
      );

      values.position = position;

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

        sails.sockets.broadcast(`project:${inputs.record.projectId}`, 'projectLabelUpdate', {
          item: {
            id: reposition.record.id,
            position: reposition.position,
          },
        });
      }
    }

    const projectLabel = await ProjectLabel.qm.updateOne(inputs.record.id, values);

    if (projectLabel) {
      // Sync changes to all board labels that were copied from this project label
      const syncedLabels = await Label.find({
        projectLabelId: projectLabel.id,
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const syncedLabel of syncedLabels) {
        const updateValues = {};

        if (!_.isUndefined(values.name)) {
          updateValues.name = values.name;
        }

        if (!_.isUndefined(values.color)) {
          updateValues.color = values.color;
        }

        if (Object.keys(updateValues).length > 0) {
          // eslint-disable-next-line no-await-in-loop
          await Label.qm.updateOne(syncedLabel.id, updateValues);

          sails.sockets.broadcast(`board:${syncedLabel.boardId}`, 'labelUpdate', {
            item: {
              id: syncedLabel.id,
              ...updateValues,
            },
          });
        }
      }

      sails.sockets.broadcast(
        `project:${projectLabel.projectId}`,
        'projectLabelUpdate',
        {
          item: projectLabel,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.PROJECT_LABEL_UPDATE,
        buildData: () => ({
          item: projectLabel,
          included: {
            projects: [inputs.project],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    return projectLabel;
  },
};
