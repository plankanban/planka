module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
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

  async fn(inputs) {
    const boardMemberships = await BoardMembership.destroy({
      boardId: inputs.record.id,
    }).fetch();

    const board = await Board.archiveOne(inputs.record.id);

    if (board) {
      sails.sockets.removeRoomMembersFromRooms(`board:${board.id}`, `board:${board.id}`);

      const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(board.projectId);
      const boardMemberUserIds = sails.helpers.utils.mapRecords(boardMemberships, 'userId');
      const boardRelatedUserIds = _.union(projectManagerUserIds, boardMemberUserIds);

      boardRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'boardDelete',
          {
            item: board,
          },
          inputs.request,
        );
      });

      sails.helpers.utils.sendWebhooks.with({
        event: 'boardDelete',
        data: {
          item: board,
          included: {
            projects: [inputs.project],
          },
        },
        user: inputs.actorUser,
      });
    }

    return board;
  },
};
