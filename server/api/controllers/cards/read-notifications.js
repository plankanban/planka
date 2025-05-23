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

    const notifications = await sails.helpers.cards.readNotificationsForUser.with({
      record: card,
      user: currentUser,
      request: this.req,
    });

    return {
      item: card,
      included: {
        notifications,
      },
    };
  },
};
