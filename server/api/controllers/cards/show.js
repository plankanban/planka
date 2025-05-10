/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
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
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, project } = await sails.helpers.cards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          card.boardId,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.CARD_NOT_FOUND; // Forbidden
        }
      }
    }

    card.isSubscribed = await sails.helpers.users.isCardSubscriber(currentUser.id, card.id);

    const users = card.creatorUserId ? await User.qm.getByIds([card.creatorUserId]) : [];
    const cardMemberships = await CardMembership.qm.getByCardId(card.id);
    const cardLabels = await CardLabel.qm.getByCardId(card.id);

    const taskLists = await TaskList.qm.getByCardId(card.id);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);

    const tasks = await Task.qm.getByTaskListIds(taskListIds);
    const attachments = await Attachment.qm.getByCardId(card.id);

    const customFieldGroups = await CustomFieldGroup.qm.getByCardId(card.id);
    const customFieldGroupIds = sails.helpers.utils.mapRecords(customFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardId(card.id);

    return {
      item: card,
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
