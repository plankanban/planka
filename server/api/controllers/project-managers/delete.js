/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-managers/{id}:
 *   delete:
 *     summary: Delete project manager
 *     description: Deletes a project manager. Requires admin privileges for shared projects or existing project manager permissions. Cannot remove the last project manager.
 *     tags:
 *       - Project Managers
 *     operationId: deleteProjectManager
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project manager to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Project manager deleted successfully
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
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  PROJECT_MANAGER_NOT_FOUND: {
    projectManagerNotFound: 'Project manager not found',
  },
  MUST_NOT_BE_LAST: {
    mustNotBeLast: 'Must not be last',
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
    projectManagerNotFound: {
      responseType: 'notFound',
    },
    mustNotBeLast: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.projectManagers
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.PROJECT_MANAGER_NOT_FOUND);

    let { projectManager } = pathToProject;
    const { project } = pathToProject;

    if (currentUser.role !== User.Roles.ADMIN) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.PROJECT_MANAGER_NOT_FOUND; // Forbidden
      }
    }

    if (project.ownerProjectManagerId) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const user = await User.qm.getOneById(projectManager.userId);

    projectManager = await sails.helpers.projectManagers.deleteOne
      .with({
        user,
        project,
        record: projectManager,
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('mustNotBeLast', () => Errors.MUST_NOT_BE_LAST);

    if (!projectManager) {
      throw Errors.PROJECT_MANAGER_NOT_FOUND;
    }

    return {
      item: projectManager,
    };
  },
};
