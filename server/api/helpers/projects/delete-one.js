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
    const projectManagers = await ProjectManager.destroy({
      projectId: inputs.record.id,
    }).fetch();

    const project = await Project.archiveOne(inputs.record.id);

    if (project) {
      const managerUserIds = sails.helpers.utils.mapRecords(projectManagers, 'userId');

      const boardIds = await sails.helpers.projects.getBoardIds(project.id);
      const boardRooms = boardIds.map((boardId) => `board:${boardId}`);

      const memberUserIds = await sails.helpers.boards.getMemberUserIds(boardIds);
      const userIds = _.union(managerUserIds, memberUserIds);

      userIds.forEach((userId) => {
        sails.sockets.removeRoomMembersFromRooms(`user:${userId}`, boardRooms);

        sails.sockets.broadcast(
          `user:${userId}`,
          'projectDelete',
          {
            item: project,
          },
          inputs.request,
        );
      });
    }

    return project;
  },
};
