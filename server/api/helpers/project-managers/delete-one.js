module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const userIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(
      inputs.record.projectId,
    );

    const projectManager = await ProjectManager.destroyOne(inputs.record.id);

    if (projectManager) {
      userIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectManagerDelete',
          {
            item: projectManager,
          },
          inputs.request,
        );
      });
    }

    return projectManager;
  },
};
