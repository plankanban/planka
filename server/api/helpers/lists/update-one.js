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
      const lists = await sails.helpers.boards.getFiniteListsById(
        inputs.board.id,
        inputs.record.id,
      );

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        lists,
      );

      values.position = position;

      if (repositions.length > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const reposition of repositions) {
          // eslint-disable-next-line no-await-in-loop
          await List.qm.updateOne(
            {
              id: reposition.record.id,
              boardId: reposition.record.boardId,
            },
            {
              position: reposition.position,
            },
          );

          sails.sockets.broadcast(`board:${inputs.board.id}`, 'listUpdate', {
            item: {
              id: reposition.record.id,
              position: reposition.position,
            },
          });

          // TODO: send webhooks
        }
      }
    }

    const { list, tasks } = await List.qm.updateOne(inputs.record.id, values);

    if (list) {
      sails.sockets.broadcast(
        `board:${list.boardId}`,
        'listUpdate',
        {
          item: list,
        },
        inputs.request,
      );

      if (tasks) {
        const taskListIds = sails.helpers.utils.mapRecords(tasks, 'taskListId', true);
        const taskLists = await TaskList.qm.getByIds(taskListIds);
        const taskListById = _.keyBy(taskLists, 'id');

        const cardIds = sails.helpers.utils.mapRecords(taskLists, 'cardId', true);
        const cards = await Card.qm.getByIds(cardIds);
        const cardById = _.keyBy(cards, 'id');

        const boardIdByTaskId = tasks.reduce(
          (result, task) => ({
            ...result,
            [task.id]: cardById[taskListById[task.taskListId].cardId].boardId,
          }),
          {},
        );

        tasks.forEach((task) => {
          sails.sockets.broadcast(`board:${boardIdByTaskId[task.id]}`, 'taskUpdate', {
            item: task,
          });
        });

        // TODO: send webhooks
      }

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.LIST_UPDATE,
        buildData: () => ({
          item: list,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    return list;
  },
};
