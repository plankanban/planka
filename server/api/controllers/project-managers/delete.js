/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
