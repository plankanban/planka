/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /custom-fields/{id}:
 *   delete:
 *     summary: Delete custom field
 *     description: Deletes a custom field. Can delete the in base custom field group (requires project manager permissions) or the custom field group (requires board editor permissions).
 *     tags:
 *       - Custom Fields
 *     operationId: deleteCustomField
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the custom field to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Custom field deleted successfully
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
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CUSTOM_FIELD_NOT_FOUND: {
    customFieldNotFound: 'Custom field not found',
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
    customFieldNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.customFields
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CUSTOM_FIELD_NOT_FOUND);

    let { customField } = pathToProject;
    const { customFieldGroup, card, list, board, baseCustomFieldGroup, project } = pathToProject;

    if (customField.baseCustomFieldGroupId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.CUSTOM_FIELD_NOT_FOUND; // Forbidden
      }

      customField = await sails.helpers.customFields.deleteOneInBaseCustomFieldGroup.with({
        project,
        baseCustomFieldGroup,
        record: customField,
        actorUser: currentUser,
        request: this.req,
      });
    } else if (customField.customFieldGroupId) {
      const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
        board.id,
        currentUser.id,
      );

      if (!boardMembership) {
        throw Errors.CUSTOM_FIELD_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }

      customField = await sails.helpers.customFields.deleteOneInCustomFieldGroup.with({
        project,
        board,
        list,
        card,
        customFieldGroup,
        record: customField,
        actorUser: currentUser,
        request: this.req,
      });
    }

    if (!customField) {
      throw Errors.CUSTOM_FIELD_NOT_FOUND;
    }

    return {
      item: customField,
    };
  },
};
