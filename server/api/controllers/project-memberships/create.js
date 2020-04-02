const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  USER_ALREADY_PROJECT_MEMBER: {
    userAlreadyProjectMember: 'User already project member',
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
    userAlreadyProjectMember: {
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
      .intercept('userAlreadyProjectMember', () => Errors.USER_ALREADY_PROJECT_MEMBER);

    return exits.success({
      item: projectMembership,
      included: {
        users: [user],
      },
    });
  },
};
