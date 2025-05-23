/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const moment = require('moment');

const { isId } = require('../../../utils/validators');
const { idInput, idsInput } = require('../../../utils/inputs');

const Errors = {
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

const isBefore = (value) => {
  if (!_.isPlainObject(value) || _.size(value) !== 2) {
    return false;
  }

  if (!moment(value.listChangedAt, moment.ISO_8601, true).isValid()) {
    return false;
  }

  if (!isId(value.id)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    listId: {
      ...idInput,
      required: true,
    },
    before: {
      type: 'json',
      custom: isBefore,
    },
    search: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    filterUserIds: idsInput,
    filterLabelIds: idsInput,
  },

  exits: {
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, project } = await sails.helpers.lists
      .getPathToProjectById(inputs.listId)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

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

    let filterUserIds;
    if (inputs.filterUserIds) {
      const boardMemberships = await BoardMembership.qm.getByBoardId(list.boardId);

      const availableUserIdsSet = new Set(
        sails.helpers.utils.mapRecords(boardMemberships, 'userId'),
      );

      filterUserIds = _.uniq(inputs.filterUserIds.split(','));
      filterUserIds = filterUserIds.filter((userId) => availableUserIdsSet.has(userId));
    }

    let filterLabelIds;
    if (inputs.filterLabelIds) {
      const labels = await Label.qm.getByBoardId(list.boardId);
      const availableLabelIdsSet = new Set(sails.helpers.utils.mapRecords(labels));

      filterLabelIds = _.uniq(inputs.filterLabelIds.split(','));
      filterLabelIds = filterLabelIds.filter((labelId) => availableLabelIdsSet.has(labelId));
    }

    const cards = await Card.qm.getByEndlessListId(list.id, {
      filterUserIds,
      filterLabelIds,
      before: inputs.before,
      search: inputs.search,
    });

    const cardIds = sails.helpers.utils.mapRecords(cards);

    const userIds = sails.helpers.utils.mapRecords(cards, 'creatorUserId', true, true);
    const users = await User.qm.getByIds(userIds);

    const cardSubscriptions = await CardSubscription.qm.getByCardIdsAndUserId(
      cardIds,
      currentUser.id,
    );

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
      items: cards,
      included: {
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
