/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /base-custom-field-groups/{baseCustomFieldGroupId}/custom-fields:
 *   post:
 *     summary: Create custom field in base custom field group
 *     description: Creates a custom field within a base custom field group. Requires project manager permissions.
 *     tags:
 *       - Custom Fields
 *     operationId: createCustomFieldInBaseGroup
 *     parameters:
 *       - name: baseCustomFieldGroupId
 *         in: path
 *         required: true
 *         description: ID of the base custom field group to create the custom field in
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BASE_CUSTOM_FIELD_GROUP_NOT_FOUND: {
    baseCustomFieldGroupNotFound: 'Base custom field group not found',
  },
};

module.exports = {
  inputs: {
    baseCustomFieldGroupId: {
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
  },

  exits: {
    baseCustomFieldGroupNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { baseCustomFieldGroup, project } = await sails.helpers.baseCustomFieldGroups
      .getPathToProjectById(inputs.baseCustomFieldGroupId)
      .intercept('pathNotFound', () => Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND);

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['position', 'name', 'showOnFrontOfCard']);

    const customField = await sails.helpers.customFields.createOneInBaseCustomFieldGroup.with({
      project,
      values: {
        ...values,
        baseCustomFieldGroup,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: customField,
    };
  },
};
