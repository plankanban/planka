/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, project } = await sails.helpers.lists
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    if (!sails.helpers.lists.isFinite(list)) {
      throw Errors.LIST_NOT_FOUND;
    }

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          list.boardId,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.LIST_NOT_FOUND; // Forbidden
        }
      }
    }

    const cards = await Card.qm.getByListId(list.id);
    const cardIds = sails.helpers.utils.mapRecords(cards);

    const userIds = sails.helpers.utils.mapRecords(cards, 'creatorUserId', true, true);
    const users = await User.qm.getByIds(userIds);

    const cardMemberships = await CardMembership.qm.getByCardIds(cardIds);
    const cardLabels = await CardLabel.qm.getByCardIds(cardIds);

    const taskLists = await TaskList.qm.getByCardIds(cardIds);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);

    const tasks = await Task.qm.getByTaskListIds(taskListIds);
    const attachments = await Attachment.qm.getByCardIds(cardIds);

    const customFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIds);
    const customFieldGroupIds = sails.helpers.utils.mapRecords(customFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardIds(cardIds);

    const cardSubscriptions = await CardSubscription.qm.getByCardIdsAndUserId(
      cardIds,
      currentUser.id,
    );

    const isSubscribedByCardId = cardSubscriptions.reduce(
      (result, cardSubscription) => ({
        ...result,
        [cardSubscription.cardId]: true,
      }),
      {},
    );

    cards.forEach((card) => {
      // eslint-disable-next-line no-param-reassign
      card.isSubscribed = isSubscribedByCardId[card.id] || false;
    });

    return {
      item: list,
      included: {
        cards,
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        customFieldGroups,
        customFields,
        customFieldValues,
        users: sails.helpers.users.presentMany(users, currentUser),
        attachments: sails.helpers.attachments.presentMany(attachments),
      },
    };
  },
};
