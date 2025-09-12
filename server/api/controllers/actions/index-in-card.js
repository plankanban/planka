/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/actions:
 *   get:
 *     summary: Get card actions
 *     description: Retrieves a list of actions (activity history) for a specific card, with pagination support.
 *     tags:
 *       - Actions
 *     operationId: getCardActions
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         description: ID of the card to get actions for
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: beforeId
 *         in: query
 *         required: false
 *         description: ID to get actions before (for pagination)
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Card actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *                 - included
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Action'
 *                 included:
 *                   type: object
 *                   required:
 *                     - users
 *                   properties:
 *                     users:
 *                       type: array
 *                       description: Related users
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
    cardId: {
      ...idInput,
      required: true,
    },
    beforeId: idInput,
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, project } = await sails.helpers.cards
      .getPathToProjectById(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      card.boardId,
      currentUser.id,
    );

    if (!boardMembership) {
      if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
        const isProjectManager = await sails.helpers.users.isProjectManager(
          currentUser.id,
          project.id,
        );

        if (!isProjectManager) {
          throw Errors.CARD_NOT_FOUND; // Forbidden
        }
      }
    }

    const actions = await Action.qm.getByCardId(card.id, {
      beforeId: inputs.beforeId,
    });

    const userIds = sails.helpers.utils.mapRecords(actions, 'userId', true, true);
    const users = await User.qm.getByIds(userIds);

    return {
      items: actions,
      included: {
        users: sails.helpers.users.presentMany(users, currentUser),
      },
    };
  },
};
