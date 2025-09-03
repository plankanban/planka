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
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    card: {
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
      const taskLists = await TaskList.qm.getByCardId(inputs.record.cardId, {
        exceptIdOrIds: inputs.record.id,
      });

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        taskLists,
      );

      values.position = position;

      if (repositions.length > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const reposition of repositions) {
          // eslint-disable-next-line no-await-in-loop
          await TaskList.qm.updateOne(
            {
              id: reposition.record.id,
              cardId: reposition.record.cardId,
            },
            {
              position: reposition.position,
            },
          );

          sails.sockets.broadcast(`board:${inputs.board.id}`, 'taskListUpdate', {
            item: {
              id: reposition.record.id,
              position: reposition.position,
            },
          });

          // TODO: send webhooks
        }
      }
    }

    const taskList = await TaskList.qm.updateOne(inputs.record.id, values);

    if (taskList) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'taskListUpdate',
        {
          item: taskList,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.TASK_LIST_UPDATE,
        buildData: () => ({
          item: taskList,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    return taskList;
  },
};
