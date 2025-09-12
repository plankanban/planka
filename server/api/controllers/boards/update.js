/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{id}:
 *   patch:
 *     summary: Update board
 *     description: Updates a board. Project managers can update all fields, board members can only subscribe/unsubscribe.
 *     tags:
 *       - Boards
 *     operationId: updateBoard
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board to update
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position of the board within the project
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the board
 *                 example: Development Board
 *               defaultView:
 *                 type: string
 *                 enum: [kanban, grid, list]
 *                 description: Default view for the board
 *                 example: kanban
 *               defaultCardType:
 *                 type: string
 *                 enum: [project, story]
 *                 description: Default card type for new cards
 *                 example: project
 *               limitCardTypesToDefaultOne:
 *                 type: boolean
 *                 description: Whether to limit card types to default one
 *                 example: false
 *               alwaysDisplayCardCreator:
 *                 type: boolean
 *                 description: Whether to always display card creators
 *                 example: false
 *               expandTaskListsByDefault:
 *                 type: boolean
 *                 description: Whether to expand task lists by default
 *                 example: false
 *               isSubscribed:
 *                 type: boolean
 *                 description: Whether the current user is subscribed to the board
 *                 example: true
 *     responses:
 *       200:
 *         description: Board updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Board'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    defaultView: {
      type: 'string',
      isIn: Object.values(Board.Views),
    },
    defaultCardType: {
      type: 'string',
      isIn: Object.values(Card.Types),
    },
    limitCardTypesToDefaultOne: {
      type: 'boolean',
    },
    alwaysDisplayCardCreator: {
      type: 'boolean',
    },
    expandTaskListsByDefault: {
      type: 'boolean',
    },
    isSubscribed: {
      type: 'boolean',
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.boards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    let { board } = pathToProject;
    const { project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);
    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isProjectManager && !isBoardMember) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const availableInputKeys = ['id'];
    if (isProjectManager) {
      availableInputKeys.push(
        'position',
        'name',
        'defaultView',
        'defaultCardType',
        'limitCardTypesToDefaultOne',
        'alwaysDisplayCardCreator',
        'expandTaskListsByDefault',
      );
    }
    if (isBoardMember) {
      availableInputKeys.push('isSubscribed');
    }

    if (_.difference(Object.keys(inputs), availableInputKeys).length > 0) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, [
      'position',
      'name',
      'defaultView',
      'defaultCardType',
      'limitCardTypesToDefaultOne',
      'alwaysDisplayCardCreator',
      'expandTaskListsByDefault',
      'isSubscribed',
    ]);

    board = await sails.helpers.boards.updateOne.with({
      values,
      project,
      record: board,
      actorUser: currentUser,
      request: this.req,
    });

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    return {
      item: board,
    };
  },
};
