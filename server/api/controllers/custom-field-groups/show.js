/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /custom-field-groups/{id}:
 *   get:
 *     summary: Get custom field group details
 *     description: Retrieves comprehensive custom field group information, including fields and values. Requires access to the board/card.
 *     tags:
 *       - Custom Field Groups
 *     operationId: getCustomFieldGroup
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the custom field group to retrieve
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Custom field group details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/CustomFieldGroup'
 *                 included:
 *                   type: object
 *                   required:
 *                     - customFields
 *                     - customFieldValues
 *                   properties:
 *                     customFields:
 *                       type: array
 *                       description: Related custom fields
 *                       items:
 *                         $ref: '#/components/schemas/CustomField'
 *                     customFieldValues:
 *                       type: array
 *                       description: Related custom field values (for card-specific groups)
 *                       items:
 *                         $ref: '#/components/schemas/CustomFieldValue'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  CUSTOM_FIELD_GROUP_NOT_FOUND: {
    customFieldGroupNotFound: 'Custom field group not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    customFieldGroupNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { customFieldGroup, board, project } = await sails.helpers.customFieldGroups
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CUSTOM_FIELD_GROUP_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          board.id,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.CUSTOM_FIELD_GROUP_NOT_FOUND; // Forbidden
        }
      }
    }

    const customFields = await CustomField.qm.getByCustomFieldGroupId(customFieldGroup.id);

    const customFieldValues = customFieldGroup.cardId
      ? await CustomFieldValue.qm.getByCustomFieldGroupId(customFieldGroup.id)
      : [];

    return {
      item: customFieldGroup,
      included: {
        customFields,
        customFieldValues,
      },
    };
  },
};
