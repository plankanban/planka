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

  exits: {
    boardInValuesMustBelongToProject: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (values.project && values.project.id === inputs.project.id) {
      delete values.project;
    }

    const project = values.project || inputs.project;

    if (values.board) {
      if (values.board.projectId !== project.id) {
        throw 'boardInValuesMustBelongToProject';
      }

      if (values.board.id === inputs.board.id) {
        delete values.board;
      } else {
        values.boardId = values.board.id;
      }
    }

    const board = values.board || inputs.board;

    if (!_.isUndefined(values.position)) {
      const lists = await sails.helpers.boards.getFiniteListsById(board.id, inputs.record.id);

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

          sails.sockets.broadcast(`board:${board.id}`, 'listUpdate', {
            item: {
              id: reposition.record.id,
              position: reposition.position,
            },
          });

          // TODO: send webhooks
        }
      }
    }

    let cardIdsByLabelId;
    let prevLabels;

    if (values.board) {
      const cards = await Card.qm.getByListId(inputs.record.id);
      const cardIds = sails.helpers.utils.mapRecords(cards);

      const cardLabels = await CardLabel.qm.getByCardIds(cardIds);

      cardIdsByLabelId = cardLabels.reduce(
        (result, { cardId, labelId }) => ({
          ...result,
          [labelId]: [...(result[labelId] || []), cardId],
        }),
        {},
      );

      prevLabels = await Label.qm.getByIds(Object.keys(cardIdsByLabelId));

      const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(values.board.id);

      await CardSubscription.qm.delete({
        cardId: cardIds,
        userId: {
          '!=': boardMemberUserIds,
        },
      });

      await CardMembership.qm.delete({
        cardId: cardIds,
        userId: {
          '!=': boardMemberUserIds,
        },
      });

      await CardLabel.qm.delete({
        cardId: cardIds,
      });

      const taskLists = await TaskList.qm.getByCardIds(cardIds);
      const taskListIds = sails.helpers.utils.mapRecords(taskLists);

      await Task.qm.update(
        {
          taskListId: taskListIds,
          assigneeUserId: {
            '!=': boardMemberUserIds,
          },
        },
        {
          assigneeUserId: null,
        },
      );

      await sails.helpers.cards.detachCustomFields(cardIds, inputs.board.id, !!values.project);
    }

    const { list, tasks } = await List.qm.updateOne(inputs.record.id, values);

    if (list) {
      if (values.board) {
        if (prevLabels.length > 0) {
          const labels = await Label.qm.getByBoardId(list.boardId);
          const labelByName = _.keyBy(labels, 'name');

          const cardLabelsValues = (
            await Promise.all(
              prevLabels.map(async (label) => {
                let labelId;
                if (labelByName[label.name]) {
                  ({ id: labelId } = labelByName[label.name]);
                } else {
                  ({ id: labelId } = await sails.helpers.labels.createOne.with({
                    project,
                    values: {
                      ..._.omit(label, ['id', 'boardId', 'createdAt', 'updatedAt']),
                      board,
                    },
                    actorUser: inputs.actorUser,
                  }));
                }

                return cardIdsByLabelId[label.id].map((cardId) => ({
                  cardId,
                  labelId,
                }));
              }),
            )
          ).flat();

          await CardLabel.qm.create(cardLabelsValues);
        }

        sails.sockets.broadcast(
          `board:${inputs.board.id}`,
          'listUpdate',
          {
            item: {
              id: list.id,
              boardId: null,
            },
          },
          inputs.request,
        );

        sails.sockets.broadcast(`board:${list.boardId}`, 'listUpdate', {
          item: list,
        });

        // TODO: add transfer action
      } else {
        sails.sockets.broadcast(
          `board:${list.boardId}`,
          'listUpdate',
          {
            item: list,
          },
          inputs.request,
        );
      }

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
