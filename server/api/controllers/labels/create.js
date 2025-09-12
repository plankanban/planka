/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/labels:
 *   post:
 *     summary: Create label
 *     description: Creates a label within a board. Requires board editor permissions.
 *     tags:
 *       - Labels
 *     operationId: createLabel
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board to create the label in
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
 *               - position
 *               - color
 *             properties:
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position of the label within the board
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 nullable: true
 *                 description: Name/title of the label
 *                 example: Bug
 *               color:
 *                 type: string
 *                 enum: [muddy-grey, autumn-leafs, morning-sky, antique-blue, egg-yellow, desert-sand, dark-granite, fresh-salad, lagoon-blue, midnight-blue, light-orange, pumpkin-orange, light-concrete, sunny-grass, navy-blue, lilac-eyes, apricot-red, orange-peel, silver-glint, bright-moss, deep-ocean, summer-sky, berry-red, light-cocoa, grey-stone, tank-green, coral-green, sugar-plum, pink-tulip, shady-rust, wet-rock, wet-moss, turquoise-sea, lavender-fields, piggy-red, light-mud, gun-metal, modern-green, french-coast, sweet-lilac, red-burgundy, pirate-gold]
 *                 description: Color of the label
 *                 example: berry-red
 *     responses:
 *       200:
 *         description: Label created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Label'
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
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    boardId: {
      ...idInput,
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['position', 'name', 'color']);

    const label = await sails.helpers.labels.createOne.with({
      project,
      values: {
        ...values,
        board,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: label,
    };
  },
};
