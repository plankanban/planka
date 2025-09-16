/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/project-managers:
 *   post:
 *     summary: Create project manager
 *     description: Creates a project manager within a project. Requires admin privileges for shared projects or existing project manager permissions. The user must be an admin or project owner.
 *     tags:
 *       - Project Managers
 *     operationId: createProjectManager
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project to create the project manager in
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
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user who is assigned as project manager
 *                 example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Project manager created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectManager'
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
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  USER_ALREADY_PROJECT_MANAGER: {
    userAlreadyProjectManager: 'User already project manager',
  },
  USER_MUST_BE_ADMIN_OR_PROJECT_OWNER: {
    userMustBeAdminOrProjectOwner: 'User must be admin or project owner',
  },
};

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    userId: {
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
    userNotFound: {
      responseType: 'notFound',
    },
    userAlreadyProjectManager: {
      responseType: 'conflict',
    },
    userMustBeAdminOrProjectOwner: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    if (currentUser.role !== User.Roles.ADMIN) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.PROJECT_NOT_FOUND; // Forbidden
      }
    }

    if (project.ownerProjectManagerId) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const user = await User.qm.getOneById(inputs.userId, {
      withDeactivated: false,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    const projectManager = await sails.helpers.projectManagers.createOne
      .with({
        values: {
          project,
          user,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('userAlreadyProjectManager', () => Errors.USER_ALREADY_PROJECT_MANAGER)
      .intercept(
        'userInValuesMustBeAdminOrProjectOwner',
        () => Errors.USER_MUST_BE_ADMIN_OR_PROJECT_OWNER,
      );

    return {
      item: projectManager,
    };
  },
};
