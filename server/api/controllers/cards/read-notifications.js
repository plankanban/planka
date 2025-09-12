/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{id}/read-notifications:
 *   post:
 *     summary: Mark card notifications as read
 *     description: Marks all notifications for a specific card as read for the current user. Requires access to the card.
 *     tags:
 *       - Cards
 *     operationId: readCardNotifications
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the card to mark notifications as read for
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Card'
 *                 included:
 *                   type: object
 *                   required:
 *                     - notifications
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       description: Related notifications
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
