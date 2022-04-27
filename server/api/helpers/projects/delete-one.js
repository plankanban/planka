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
    const boardIds = await sails.helpers.projects.getBoardIds(inputs.record.id);

    await BoardMembership.destroy({
      boardId: boardIds,
    }).fetch();

    const projectManagers = await ProjectManager.destroy({
      projectId: inputs.record.id,
    }).fetch();

    const project = await Project.archiveOne(inputs.record.id);

    if (project) {
      const managerUserIds = sails.helpers.utils.mapRecords(projectManagers, 'userId');

      const memberUserIds = await sails.helpers.boards.getMemberUserIds(boardIds);
      const userIds = _.union(managerUserIds, memberUserIds);

      userIds.forEach((userId) => {
        sails.sockets.removeRoomMembersFromRooms(
          `user:${userId}`,
          boardIds.map((boardId) => `board:${boardId}`),
        );

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
