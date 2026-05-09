/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-group-mappings:
 *   post:
 *     summary: Create a project group mapping
 *     description: Maps an OIDC group name to a project. Users with the group claim
 *                  are granted project-manager access on next OIDC login. Admin only.
 *     tags:
 *       - Project Group Mappings
 *     operationId: createProjectGroupMapping
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupName
 *               - projectId
 *             properties:
 *               groupName:
 *                 type: string
 *                 example: "developers"
 *               projectId:
 *                 type: string
 *                 example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Mapping created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectGroupMapping'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  MAPPING_ALREADY_EXISTS: {
    mappingAlreadyExists: 'Mapping already exists',
  },
};

module.exports = {
  inputs: {
    groupName: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 256,
    },
    projectId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    projectNotFound: {
      responseType: 'notFound',
    },
    mappingAlreadyExists: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (currentUser.role !== User.Roles.ADMIN) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const project = await Project.qm.getOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const mapping = await sails.helpers.projectGroupMappings.createOne
      .with({
        values: {
          groupName: inputs.groupName.trim(),
          project,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('mappingAlreadyExists', () => Errors.MAPPING_ALREADY_EXISTS);

    return {
      item: mapping,
    };
  },
};
