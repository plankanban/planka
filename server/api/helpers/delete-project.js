module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true
    },
    request: {
      type: 'ref'
    }
  },

  fn: async function(inputs, exits) {
    const projectMemberships = await ProjectMembership.destroy({
      projectId: inputs.record.id
    }).fetch();

    const project = await Project.archiveOne(inputs.record.id);

    if (project) {
      const userIds = sails.helpers.mapRecords(projectMemberships, 'userId');

      const boards = await sails.helpers.getBoardsForProject(project.id);
      const boardRooms = boards.map(board => `board:${board.id}`);

      userIds.forEach(userId => {
        sails.sockets.removeRoomMembersFromRooms(`user:${userId}`, boardRooms);

        sails.sockets.broadcast(
          `user:${userId}`,
          'projectDelete',
          {
            item: project
          },
          inputs.request
        );
      });
    }

    return exits.success(project);
  }
};
