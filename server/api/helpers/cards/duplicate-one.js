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
    join: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    positionMustBeInValues: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (sails.helpers.lists.isFinite(inputs.list)) {
      if (_.isUndefined(values.position)) {
        throw 'positionMustBeInValues';
      }

      const cards = await Card.qm.getByListId(inputs.list.id);

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

    let card = await Card.qm.createOne({
      ..._.pick(inputs.record, [
        'boardId',
        'listId',
        'prevListId',
        'type',
        'name',
        'description',
        'dueDate',
        'stopwatch',
      ]),
      ...values,
      creatorUserId: values.creatorUser.id,
      listChangedAt: new Date().toISOString(),
    });

    const cardMemberships = await CardMembership.qm.getByCardId(inputs.record.id);

    const cardMembershipsValues = cardMemberships.map((cardMembership) => ({
      ..._.pick(cardMembership, ['userId']),
      cardId: card.id,
    }));

    const nextCardMemberships = await CardMembership.qm.create(cardMembershipsValues);

    const cardLabels = await CardLabel.qm.getByCardId(inputs.record.id);

    const cardLabelsValues = cardLabels.map((cardLabel) => ({
      ..._.pick(cardLabel, ['labelId']),
      cardId: card.id,
    }));

    const nextCardLabels = await CardLabel.qm.create(cardLabelsValues);

    const taskLists = await TaskList.qm.getByCardId(inputs.record.id);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);

    const tasks = await Task.qm.getByTaskListIds(taskListIds);
    const attachments = await Attachment.qm.getByCardId(inputs.record.id);

    const customFieldGroups = await CustomFieldGroup.qm.getByCardId(inputs.record.id);
    const customFieldGroupIds = sails.helpers.utils.mapRecords(customFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardId(inputs.record.id);

    const ids = await sails.helpers.utils.generateIds(
      taskLists.length + attachments.length + customFieldGroups.length + customFields.length,
    );

    const nextTaskListIdByTaskListId = {};
    const nextTaskListsValues = await taskLists.map((taskList) => {
      const id = ids.shift();
      nextTaskListIdByTaskListId[taskList.id] = id;

      return {
        ..._.pick(taskList, ['position', 'name', 'showOnFrontOfCard']),
        id,
        cardId: card.id,
      };
    });

    const nextTaskLists = await TaskList.qm.create(nextTaskListsValues);

    const nextTasksValues = tasks.map((task) => ({
      ..._.pick(task, ['assigneeUserId', 'position', 'name', 'isCompleted']),
      taskListId: nextTaskListIdByTaskListId[task.taskListId],
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
        card = await Card.qm.updateOne(card.id, {
          coverAttachmentId: nextCoverAttachmentId,
        });
      }
    }

    const nextCustomFieldGroupIdByCustomFieldGroupId = {};
    const nextCustomFieldGroupsValues = customFieldGroups.map((customFieldGroup) => {
      const id = ids.shift();
      nextCustomFieldGroupIdByCustomFieldGroupId[customFieldGroup.id] = id;

      return {
        ..._.pick(customFieldGroup, ['baseCustomFieldGroupId', 'position', 'name']),
        id,
        cardId: card.id,
      };
    });

    const nextCustomFieldGroups = await CustomFieldGroup.qm.create(nextCustomFieldGroupsValues);

    const nextCustomFieldIdByCustomFieldId = {};
    const nextCustomFieldsValues = customFields.map((customField) => {
      const id = ids.shift();
      nextCustomFieldIdByCustomFieldId[customField.id] = id;

      return {
        ..._.pick(customField, ['position', 'name', 'showOnFrontOfCard']),
        id,
        customFieldGroupId:
          nextCustomFieldGroupIdByCustomFieldGroupId[customField.customFieldGroupId],
      };
    });

    const nextCustomFields = await CustomField.qm.create(nextCustomFieldsValues);

    const nextCustomFieldValuesValues = customFieldValues.map((customFieldValue) => ({
      ..._.pick(customFieldValue, ['content']),
      cardId: card.id,
      customFieldGroupId:
        nextCustomFieldGroupIdByCustomFieldGroupId[customFieldValue.customFieldGroupId] ||
        customFieldValue.customFieldGroupId,
      customFieldId:
        nextCustomFieldIdByCustomFieldId[customFieldValue.customFieldId] ||
        customFieldValue.customFieldId,
    }));

    const nextCustomFieldValues = await CustomFieldValue.qm.create(nextCustomFieldValuesValues);

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
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
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
      webhooks,
      values: {
        card,
        type: Action.Types.CREATE_CARD, // TODO: introduce separate type?
        data: {
          card: _.pick(card, ['name']),
          list: _.pick(inputs.list, ['id', 'type', 'name']),
        },
        user: values.creatorUser,
      },
      project: inputs.project,
      board: inputs.board,
      list: inputs.list,
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
