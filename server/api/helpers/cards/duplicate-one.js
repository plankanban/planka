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
    request: {
      type: 'ref',
    },
  },

  exits: {
    positionMustBeInValues: {},
    boardInValuesMustBelongToProject: {},
    listMustBeInValues: {},
    listInValuesMustBelongToBoard: {},
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

    if (values.list) {
      if (values.list.boardId !== board.id) {
        throw 'listInValuesMustBelongToBoard';
      }

      if (values.list.id === inputs.list.id) {
        delete values.list;
      } else {
        values.listId = values.list.id;
      }
    } else if (values.board) {
      throw 'listMustBeInValues';
    }

    const list = values.list || inputs.list;

    if (sails.helpers.lists.isFinite(list)) {
      if (values.list && _.isUndefined(values.position)) {
        throw 'positionMustBeInValues';
      }
    } else {
      values.position = null;
    }

    if (sails.helpers.lists.isFinite(list)) {
      if (_.isUndefined(values.position)) {
        throw 'positionMustBeInValues';
      }

      const cards = await Card.qm.getByListId(list.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        cards,
      );

      values.position = position;

      if (repositions.length > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const reposition of repositions) {
          // eslint-disable-next-line no-await-in-loop
          await Card.qm.updateOne(
            {
              id: reposition.record.id,
              listId: reposition.record.listId,
            },
            {
              position: reposition.position,
            },
          );

          sails.sockets.broadcast(`board:${inputs.record.boardId}`, 'cardUpdate', {
            item: {
              id: reposition.record.id,
              position: reposition.position,
            },
          });

          // TODO: send webhooks
        }
      }
    }

    let labelIds;
    if (values.board) {
      const prevLabels = await sails.helpers.cards.getLabels(inputs.record.id);

      const labels = await Label.qm.getByBoardId(values.board.id);
      const labelByName = _.keyBy(labels, 'name');

      labelIds = await Promise.all(
        prevLabels.map(async (label) => {
          if (labelByName[label.name]) {
            return labelByName[label.name].id;
          }

          const { id } = await sails.helpers.labels.createOne.with({
            project,
            values: {
              ..._.omit(label, ['id', 'boardId', 'createdAt', 'updatedAt']),
              board,
            },
            actorUser: values.creatorUser,
          });

          return id;
        }),
      );
    }

    if (values.list) {
      const typeState = List.TYPE_STATE_BY_TYPE[values.list.type];

      if (inputs.record.isClosed) {
        if (typeState === List.TypeStates.OPENED) {
          values.isClosed = false;
        }
      } else if (typeState === List.TypeStates.CLOSED) {
        values.isClosed = true;
      }
    }

    if (!values.name) {
      const t = sails.helpers.utils.makeTranslator(values.creatorUser.language);
      values.name = `${inputs.record.name} (${t('copy')})`;
    }

    let card = await Card.qm.createOne({
      ..._.pick(inputs.record, [
        'boardId',
        'listId',
        'prevListId',
        'type',
        'name',
        'description',
        'dueDate',
        'isDueCompleted',
        'stopwatch',
        'isClosed',
      ]),
      ...values,
      creatorUserId: values.creatorUser.id,
      listChangedAt: new Date().toISOString(),
    });

    const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(card.boardId);
    const boardMemberUserIdsSet = new Set(boardMemberUserIds);

    const cardMemberships = await CardMembership.qm.getByCardId(inputs.record.id, {
      userIdOrIds: boardMemberUserIds,
    });

    const cardMembershipsValues = cardMemberships.map((cardMembership) => ({
      ..._.pick(cardMembership, ['userId']),
      cardId: card.id,
    }));

    const nextCardMemberships = await CardMembership.qm.create(cardMembershipsValues);

    if (!values.board) {
      const cardLabels = await CardLabel.qm.getByCardId(inputs.record.id);
      labelIds = sails.helpers.utils.mapRecords(cardLabels, 'labelId');
    }

    const cardLabelsValues = labelIds.map((labelId) => ({
      labelId,
      cardId: card.id,
    }));

    const nextCardLabels = await CardLabel.qm.create(cardLabelsValues);

    const taskLists = await TaskList.qm.getByCardId(inputs.record.id);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);

    const tasks = await Task.qm.getByTaskListIds(taskListIds);
    const attachments = await Attachment.qm.getByCardId(inputs.record.id);

    const ids = await sails.helpers.utils.generateIds(taskLists.length + attachments.length);

    const nextTaskListIdByTaskListId = {};
    const nextTaskListsValues = await taskLists.map((taskList) => {
      const id = ids.shift();
      nextTaskListIdByTaskListId[taskList.id] = id;

      return {
        ..._.pick(taskList, ['position', 'name', 'showOnFrontOfCard', 'hideCompletedTasks']),
        id,
        cardId: card.id,
      };
    });

    const nextTaskLists = await TaskList.qm.create(nextTaskListsValues);

    const nextTasksValues = tasks.map((task) => ({
      ..._.pick(task, ['linkedCardId', 'position', 'name', 'isCompleted']),
      taskListId: nextTaskListIdByTaskListId[task.taskListId],
      assigneeUserId: boardMemberUserIdsSet.has(task.assigneeUserId) ? task.assigneeUserId : null,
    }));

    const nextTasks = await Task.qm.create(nextTasksValues);

    const nextAttachmentIdByAttachmentId = {};
    const nextAttachmentsValues = attachments.map((attachment) => {
      const id = ids.shift();
      nextAttachmentIdByAttachmentId[attachment.id] = id;

      return {
        ..._.pick(attachment, ['type', 'data', 'name']),
        id,
        cardId: card.id,
        creatorUserId: card.creatorUserId,
      };
    });

    const nextAttachments = await Attachment.qm.create(nextAttachmentsValues);

    if (inputs.record.coverAttachmentId) {
      const nextCoverAttachmentId = nextAttachmentIdByAttachmentId[inputs.record.coverAttachmentId];

      if (nextCoverAttachmentId) {
        ({ card } = await Card.qm.updateOne(card.id, {
          coverAttachmentId: nextCoverAttachmentId,
        }));
      }
    }

    const {
      customFieldGroups: nextCustomFieldGroups,
      customFields: nextCustomFields,
      customFieldValues: nextCustomFieldValues,
    } = await sails.helpers.cards.copyCustomFields(
      inputs.record,
      card,
      !!values.board,
      !!values.project,
    );

    sails.sockets.broadcast(
      `board:${card.boardId}`,
      'cardCreate',
      {
        item: card,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CARD_CREATE,
      buildData: () => ({
        item: card,
        included: {
          projects: [project],
          boards: [board],
          lists: [list],
          cardMemberships: nextCardMemberships,
          cardLabels: nextCardLabels,
          taskLists: nextTaskLists,
          tasks: nextTasks,
          attachments: sails.helpers.attachments.presentMany(nextAttachments),
          customFieldGroups: nextCustomFieldGroups,
          customFields: nextCustomFields,
          customFieldValues: nextCustomFieldValues,
        },
      }),
      user: values.creatorUser,
    });

    if (values.creatorUser.subscribeToOwnCards) {
      try {
        await CardSubscription.qm.createOne({
          cardId: card.id,
          userId: card.creatorUserId,
        });
      } catch (error) {
        if (error.code !== 'E_UNIQUE') {
          throw error;
        }
      }

      sails.sockets.broadcast(`user:${card.creatorUserId}`, 'cardUpdate', {
        item: {
          id: card.id,
          isSubscribed: true,
        },
      });

      // TODO: send webhooks
    }

    await sails.helpers.actions.createOne.with({
      project,
      board,
      list,
      webhooks,
      values: {
        card,
        type: Action.Types.CREATE_CARD, // TODO: introduce separate type?
        data: {
          card: _.pick(card, ['name']),
          list: _.pick(list, ['id', 'type', 'name']),
        },
        user: values.creatorUser,
      },
    });

    return {
      card,
      cardMemberships: nextCardMemberships,
      cardLabels: nextCardLabels,
      taskLists: nextTaskLists,
      tasks: nextTasks,
      attachments: nextAttachments,
      customFieldGroups: nextCustomFieldGroups,
      customFields: nextCustomFields,
      customFieldValues: nextCustomFieldValues,
    };
  },
};
