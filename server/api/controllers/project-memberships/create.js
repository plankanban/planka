const Errors = {
  PROJECT_NOT_FOUND: {
    notFound: 'Project is not found',
  },
  USER_NOT_FOUND: {
    notFound: 'User is not found',
  },
  PROJECT_MEMBERSHIP_EXIST: {
    conflict: 'Project membership is already exist',
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
    notFound: {
      responseType: 'notFound',
    },
    conflict: {
      responseType: 'conflict',
    },
  },

  async fn(inputs, exits) {
    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const user = await sails.helpers.getUser(inputs.userId);

    if (!user) {
      throw Error.USER_NOT_FOUND;
    }

    const projectMembership = await sails.helpers
      .createProjectMembership(project, user, this.req)
      .intercept('conflict', () => Errors.PROJECT_MEMBERSHIP_EXIST);

    return exits.success({
      item: projectMembership,
      included: {
        users: [user],
      },
    });
  },
};
