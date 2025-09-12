/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /custom-field-groups/{id}:
 *   patch:
 *     summary: Update custom field group
 *     description: Updates a custom field group. Supports both board-wide and card-specific groups. Requires board editor permissions.
 *     tags:
 *       - Custom Field Groups
 *     operationId: updateCustomFieldGroup
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the custom field group to update
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
 *                 description: Position of the custom field group within the board/card
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 nullable: true
 *                 description: Name/title of the custom field group
 *                 example: Properties
 *     responses:
 *       200:
 *         description: Custom field group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/CustomFieldGroup'
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
  CUSTOM_FIELD_GROUP_NOT_FOUND: {
    customFieldGroupNotFound: 'Custom field group not found',
  },
  NAME_MUST_NOT_BE_NULL: {
    nameMustNotBeNull: 'Name must not be null',
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
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    customFieldGroupNotFound: {
      responseType: 'notFound',
    },
    nameMustNotBeNull: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.customFieldGroups
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CUSTOM_FIELD_GROUP_NOT_FOUND);

    let { customFieldGroup } = pathToProject;
    const { card, list, board, project } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CUSTOM_FIELD_GROUP_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['position', 'name']);

    if (customFieldGroup.boardId) {
      customFieldGroup = await sails.helpers.customFieldGroups.updateOneInBoard
        .with({
          values,
          project,
          board,
          record: customFieldGroup,
          actorUser: currentUser,
          request: this.req,
        })
        .intercept('nameInValuesMustNotBeNull', () => Errors.NAME_MUST_NOT_BE_NULL);
    } else if (customFieldGroup.cardId) {
      customFieldGroup = await sails.helpers.customFieldGroups.updateOneInCard
        .with({
          values,
          project,
          board,
          list,
          card,
          record: customFieldGroup,
          actorUser: currentUser,
          request: this.req,
        })
        .intercept('nameInValuesMustNotBeNull', () => Errors.NAME_MUST_NOT_BE_NULL);
    }

    if (!customFieldGroup) {
      throw Errors.CUSTOM_FIELD_GROUP_NOT_FOUND;
    }

    return {
      item: customFieldGroup,
    };
  },
};
