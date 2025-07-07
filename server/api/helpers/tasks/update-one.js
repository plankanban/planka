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
    taskList: {
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
    taskListInValuesMustBelongToCard: {},
  },

  // TODO: use normalizeValues
  async fn(inputs) {
    const { values } = inputs;

    if (values.taskList) {
      if (values.taskList.cardId !== inputs.card.id) {
        throw 'taskListInValuesMustBelongToCard';
      }

      if (values.taskList.id === inputs.taskList.id) {
        delete values.taskList;
      } else {
        values.taskListId = values.taskList.id;
      }
    }

    const taskList = values.taskList || inputs.taskList;

    if (!_.isUndefined(values.position)) {
      const tasks = await Task.qm.getByTaskListId(taskList.id, {
        exceptIdOrIds: inputs.record.id,
      });

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        tasks,
      );

      values.position = position;

      // eslint-disable-next-line no-restricted-syntax
      for (const reposition of repositions) {
        // eslint-disable-next-line no-await-in-loop
        await Task.qm.updateOne(
          {
            id: reposition.record.id,
            taskListId: reposition.record.taskListId,
          },
          {
            position: reposition.position,
          },
        );

        sails.sockets.broadcast(`board:${inputs.board.id}`, 'taskUpdate', {
          item: {
            id: reposition.record.id,
            position: reposition.position,
          },
        });

        // TODO: send webhooks
      }
    }

    const task = await Task.qm.updateOne(inputs.record.id, values);

    if (task) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'taskUpdate',
        {
          item: task,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.TASK_UPDATE,
        buildData: () => ({
          item: task,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [inputs.card],
            taskLists: [taskList],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
          included: {
            taskLists: [inputs.taskList],
          },
        }),
        user: inputs.actorUser,
      });

      if (inputs.record.isCompleted !== task.isCompleted) {
        await sails.helpers.actions.createOne.with({
          webhooks,
          values: {
            type: task.isCompleted ? Action.Types.COMPLETE_TASK : Action.Types.UNCOMPLETE_TASK,
            data: {
              card: _.pick(inputs.card, ['name']),
              task: _.pick(task, ['id', 'name']),
            },
            user: inputs.actorUser,
            card: inputs.card,
          },
          project: inputs.project,
          board: inputs.board,
          list: inputs.list,
        });
      }
    }

    return task;
  },
};
