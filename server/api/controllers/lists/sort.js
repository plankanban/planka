/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /lists/{id}/sort:
 *   post:
 *     summary: Sort cards in list
 *     description: Sorts all cards within a list. Requires board editor permissions.
 *     tags:
 *       - Lists
 *     operationId: sortList
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the list to sort
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
 *               - fieldName
 *             properties:
 *               fieldName:
 *                 type: string
 *                 enum: [name, dueDate, createdAt]
 *                 description: Field to sort cards by
 *                 example: name
 *               order:
 *                 type: string
 *                 enum: [asc, desc]
 *                 description: Sorting order
 *                 example: asc
 *     responses:
 *       200:
 *         description: List sorted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/List'
 *                 included:
 *                   type: object
 *                   properties:
 *                     cards:
 *                       type: array
 *                       description: Related cards
 *                       items:
 *                         $ref: '#/components/schemas/Card'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  CANNOT_BE_SORTED_AS_ENDLESS_LIST: {
    cannotBeSortedAsEndlessList: 'Cannot be sorted as endless list',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    fieldName: {
      type: 'string',
      isIn: Object.values(List.SortFieldNames),
      required: true,
    },
    order: {
      type: 'string',
      isIn: Object.values(List.SortOrders),
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
    cannotBeSortedAsEndlessList: {
      responseType: 'unprocessableEntity',
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

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const options = _.pick(inputs, ['fieldName', 'order']);

    const cards = await sails.helpers.lists.sortOne
      .with({
        options,
        project,
        board,
        record: list,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('cannotBeSortedAsEndlessList', () => Errors.CANNOT_BE_SORTED_AS_ENDLESS_LIST);

    return {
      item: list,
      included: {
        cards,
      },
    };
  },
};
