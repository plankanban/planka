/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/base-custom-field-groups:
 *   post:
 *     summary: Create base custom field group
 *     description: Creates a base custom field group within a project. Requires project manager permissions.
 *     tags:
 *       - Base Custom Field Groups
 *     operationId: createBaseCustomFieldGroup
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project to create the base custom field group in
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the base custom field group
 *                 example: Base Properties
 *     responses:
 *       200:
 *         description: Base custom field group created successfully
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
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['name']);

    const baseCustomFieldGroup = await sails.helpers.baseCustomFieldGroups.createOne.with({
      values: {
        ...values,
        project,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: baseCustomFieldGroup,
    };
  },
};
