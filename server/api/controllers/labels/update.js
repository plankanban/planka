/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /labels/{id}:
 *   patch:
 *     summary: Update label
 *     description: Updates a label. Requires board editor permissions.
 *     tags:
 *       - Labels
 *     operationId: updateLabel
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the label to update
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
 *         description: Label updated successfully
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
  LABEL_NOT_FOUND: {
    labelNotFound: 'Label not found',
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
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    labelNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.labels
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.LABEL_NOT_FOUND);

    let { label } = pathToProject;
    const { board, project } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.LABEL_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['position', 'name', 'color']);

    label = await sails.helpers.labels.updateOne.with({
      values,
      project,
      board,
      record: label,
      actorUser: currentUser,
      request: this.req,
    });

    if (!label) {
      throw Errors.LABEL_NOT_FOUND;
    }

    return {
      item: label,
    };
  },
};
