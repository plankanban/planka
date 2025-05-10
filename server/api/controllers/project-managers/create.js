/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
