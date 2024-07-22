const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  USER_ALREADY_PROJECT_MANAGER: {
    userAlreadyProjectManager: 'User already project manager',
  },
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    userAlreadyProjectManager: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    const user = await sails.helpers.users.getOne(inputs.userId);

    if (!user) {
      throw Error.USER_NOT_FOUND;
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
      .intercept('userAlreadyProjectManager', () => Errors.USER_ALREADY_PROJECT_MANAGER);

    return {
      item: projectManager,
    };
  },
};
