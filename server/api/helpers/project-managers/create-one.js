const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.project)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    userAlreadyProjectManager: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    const projectManager = await ProjectManager.create({
      projectId: values.project.id,
      userId: values.user.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyProjectManager')
      .fetch();

    const projectRelatedUserIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(
      projectManager.projectId,
    );

    projectRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'projectManagerCreate',
        {
          item: projectManager,
        },
        inputs.request,
      );
    });

    sails.helpers.utils.sendWebhooks.with({
      event: 'projectManagerCreate',
      data: {
        item: projectManager,
        included: {
          users: [values.user],
          projects: [values.project],
        },
      },
      user: inputs.actorUser,
    });

    return projectManager;
  },
};
