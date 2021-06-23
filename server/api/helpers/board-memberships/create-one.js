module.exports = {
  inputs: {
    user: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    userAlreadyBoardMember: {},
  },

  async fn(inputs) {
    const boardMembership = await BoardMembership.create({
      boardId: inputs.board.id,
      userId: inputs.user.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyBoardMember')
      .fetch();

    sails.sockets.broadcast(
      `user:${boardMembership.userId}`,
      'boardMembershipCreate',
      {
        item: boardMembership,
      },
      inputs.request,
    );

    sails.sockets.broadcast(
      `board:${boardMembership.boardId}`,
      'boardMembershipCreate',
      {
        item: boardMembership,
      },
      inputs.request,
    );

    return boardMembership;
  },
};
