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

  async fn(inputs, exits) {
    const board = await Board.archiveOne(inputs.record.id);

    if (board) {
      sails.sockets.leaveAll(`board:${board.id}`);

      const userIds = await sails.helpers.getMembershipUserIdsForProject(board.projectId);

      userIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'boardDelete',
          {
            item: board,
          },
          inputs.request,
        );
      });
    }

    return exits.success(board);
  },
};
