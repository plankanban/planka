/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /custom-field-groups/{customFieldGroupId}/custom-fields:
 *   post:
 *     summary: Create custom field in custom field group
 *     description: Creates a custom field within a custom field group. Requires board editor permissions.
 *     tags:
 *       - Custom Fields
 *     operationId: createCustomFieldInGroup
 *     parameters:
 *       - name: customFieldGroupId
 *         in: path
 *         required: true
 *         description: ID of the custom field group to create the custom field in
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
 *               - name
 *             properties:
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position of the custom field within the group
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the custom field
 *                 example: Priority
 *               showOnFrontOfCard:
 *                 type: boolean
 *                 description: Whether to show the field on the front of cards
 *                 example: false
 *               type:
 *                 type: string
 *                 enum: [text, number, date, checkbox, dropdown]
 *                 description: Type of the custom field
 *                 example: dropdown
 *               config:
 *                 type: object
 *                 description: Type-specific configuration (required for `dropdown`)
 *                 example:
 *                   options:
 *                     - name: High
 *                       color: berry-red
 *     responses:
 *       200:
 *         description: Custom field created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/CustomField'
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
const CUSTOM_FIELD_TYPES = require('../../../utils/custom-field-types');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CUSTOM_FIELD_GROUP_NOT_FOUND: {
    customFieldGroupNotFound: 'Custom field group not found',
  },
  INVALID_CONFIG: {
    invalidConfig: 'Invalid config',
  },
};

module.exports = {
  inputs: {
    customFieldGroupId: {
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
      maxLength: 128,
      required: true,
    },
    showOnFrontOfCard: {
      type: 'boolean',
    },
    type: {
      type: 'string',
      isIn: CUSTOM_FIELD_TYPES,
    },
    config: {
      type: 'json',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    customFieldGroupNotFound: {
      responseType: 'notFound',
    },
    invalidConfig: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { customFieldGroup, card, list, board, project } = await sails.helpers.customFieldGroups
      .getPathToProjectById(inputs.customFieldGroupId)
      .intercept('pathNotFound', () => Errors.CUSTOM_FIELD_GROUP_NOT_FOUND);

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

    const values = _.pick(inputs, ['position', 'name', 'showOnFrontOfCard', 'type']);
    const type = values.type || 'text';

    values.config = await sails.helpers.customFields.normalizeConfig
      .with({
        type,
        config: inputs.config,
      })
      .intercept('invalidConfig', () => Errors.INVALID_CONFIG);

    const customField = await sails.helpers.customFields.createOneInCustomFieldGroup.with({
      project,
      board,
      list,
      card,
      values: {
        ...values,
        customFieldGroup,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: customField,
    };
  },
};
