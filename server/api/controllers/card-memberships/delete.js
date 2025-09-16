/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/card-memberships/userId:{userId}:
 *   delete:
 *     summary: Remove user from card
 *     description: Removes a user from a card. Requires board editor permissions.
 *     tags:
 *       - Card Memberships
 *     operationId: deleteCardMembership
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         description: ID of the card to remove the user from
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user to remove from the card
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: User removed from card successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/CardMembership'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  USER_NOT_CARD_MEMBER: {
    userNotCardMember: 'User not card member',
  },
};

module.exports = {
  inputs: {
    cardId: {
      ...idInput,
      required: true,
    },
    userId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    userNotCardMember: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, list, board, project } = await sails.helpers.cards
      .getPathToProjectById(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let cardMembership = await CardMembership.qm.getOneByCardIdAndUserId(
      inputs.cardId,
      inputs.userId,
    );

    if (!cardMembership) {
      throw Errors.USER_NOT_CARD_MEMBER;
    }

    const user = await User.qm.getOneById(cardMembership.userId);

    cardMembership = await sails.helpers.cardMemberships.deleteOne.with({
      user,
      project,
      board,
      list,
      card,
      record: cardMembership,
      actorUser: currentUser,
      request: this.req,
    });

    if (!cardMembership) {
      throw Errors.USER_NOT_CARD_MEMBER;
    }

    return {
      item: cardMembership,
    };
  },
};
