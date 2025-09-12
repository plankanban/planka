/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /lists/{id}/move-cards:
 *   post:
 *     summary: Move cards
 *     description: Moves all cards from a closed list to an archive list. Requires board editor permissions.
 *     tags:
 *       - Lists
 *     operationId: moveListCards
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the source list (must be a closed-type list)
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *             properties:
 *               listId:
 *                 type: string
 *                 description: ID of the target list (must be an archive-type list)
 *                 example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Cards moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/List'
 *                 included:
 *                   type: object
 *                   required:
 *                     - cards
 *                     - actions
 *                   properties:
 *                     cards:
 *                       type: array
 *                       description: Related cards
 *                       items:
 *                         $ref: '#/components/schemas/Card'
 *                     actions:
 *                       type: array
 *                       description: Related actions
 *                       items:
 *                         $ref: '#/components/schemas/Action'
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
    listId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, board, project } = await sails.helpers.lists
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    // TODO: allow for other types?
    if (list.type !== List.Types.CLOSED) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const nextList = await List.qm.getOneById(inputs.listId, {
      boardId: board.id,
    });

    if (!nextList) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    // TODO: allow for other types?
    if (nextList.type !== List.Types.ARCHIVE) {
      throw Errors.LIST_NOT_FOUND;
    }

    const { cards, actions } = await sails.helpers.lists.moveCards.with({
      project,
      board,
      record: list,
      values: {
        list: nextList,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: list,
      included: {
        cards,
        actions,
      },
    };
  },
};
