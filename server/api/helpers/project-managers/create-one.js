module.exports = {
  inputs: {
    user: {
      type: 'ref',
      required: true,
    },
    project: {
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
    const projectManager = await ProjectManager.create({
      projectId: inputs.project.id,
      userId: inputs.user.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyProjectManager')
      .fetch();

    const userIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(
      projectManager.projectId,
    );

    userIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'projectManagerCreate',
        {
          item: projectManager,
        },
        inputs.request,
      );
    });

    return projectManager;
  },
};
