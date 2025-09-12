/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/custom-field-groups:
 *   post:
 *     summary: Create board custom field group
 *     description: Creates a custom field group within a board. Either `baseCustomFieldGroupId` or `name` must be provided. Requires board editor permissions.
 *     tags:
 *       - Custom Field Groups
 *     operationId: createBoardCustomFieldGroup
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         description: ID of the board to create the custom field group in
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
 *             properties:
 *               baseCustomFieldGroupId:
 *                 type: string
 *                 description: ID of the base custom field group used as a template
 *                 example: "1357158568008091265"
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position of the custom field group within the board
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 nullable: true
 *                 description: Name/title of the custom field group (required if `baseCustomFieldGroupId` is not provided)
 *                 example: Properties
 *     responses:
 *       200:
 *         description: Custom field group created successfully
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
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  BASE_CUSTOM_FIELD_GROUP_NOT_FOUND: {
    baseCustomFieldGroupNotFound: 'Base custom field group not found',
  },
  BASE_CUSTOM_FIELD_GROUP_OR_NAME_MUST_BE_PRESENT: {
    baseCustomFieldGroupOrNameMustBePresent: 'Base custom field group or name must be present',
  },
};

module.exports = {
  inputs: {
    boardId: {
      ...idInput,
      required: true,
    },
    baseCustomFieldGroupId: idInput,
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
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    boardNotFound: {
      responseType: 'notFound',
    },
    baseCustomFieldGroupNotFound: {
      responseType: 'notFound',
    },
    baseCustomFieldGroupOrNameMustBePresent: {
      responseType: 'unprocessableEntity',
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

    let baseCustomFieldGroup;
    if (inputs.baseCustomFieldGroupId) {
      baseCustomFieldGroup = await BaseCustomFieldGroup.qm.getOneById(
        inputs.baseCustomFieldGroupId,
        {
          projectId: project.id,
        },
      );

      if (!baseCustomFieldGroup) {
        throw Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND;
      }
    }

    const values = _.pick(inputs, ['position', 'name']);

    const customFieldGroup = await sails.helpers.customFieldGroups.createOneInBoard
      .with({
        project,
        values: {
          ...values,
          board,
          baseCustomFieldGroup,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept(
        'baseCustomFieldGroupOrNameMustBeInValues',
        () => Errors.BASE_CUSTOM_FIELD_GROUP_OR_NAME_MUST_BE_PRESENT,
      );

    return {
      item: customFieldGroup,
    };
  },
};
