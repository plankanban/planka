/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /base-custom-field-groups/{id}:
 *   patch:
 *     summary: Update base custom field group
 *     description: Updates a base custom field group. Requires project manager permissions.
 *     tags:
 *       - Base Custom Field Groups
 *     operationId: updateBaseCustomFieldGroup
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the base custom field group to update
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
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the base custom field group
 *                 example: Base Properties
 *     responses:
 *       200:
 *         description: Base custom field group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BaseCustomFieldGroup'
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
  BASE_CUSTOM_FIELD_GROUP_NOT_FOUND: {
    baseCustomFieldGroupNotFound: 'Base custom field group not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
  },

  exits: {
    baseCustomFieldGroupNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.baseCustomFieldGroups
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND);

    let { baseCustomFieldGroup } = pathToProject;
    const { project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['name']);

    baseCustomFieldGroup = await sails.helpers.baseCustomFieldGroups.updateOne.with({
      values,
      project,
      record: baseCustomFieldGroup,
      actorUser: currentUser,
      request: this.req,
    });

    if (!baseCustomFieldGroup) {
      throw Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND;
    }

    return {
      item: baseCustomFieldGroup,
    };
  },
};
