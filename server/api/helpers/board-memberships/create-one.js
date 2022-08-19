module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
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
    if (inputs.values.role === BoardMembership.Roles.EDITOR) {
      delete inputs.values.canComment; // eslint-disable-line no-param-reassign
    } else if (inputs.values.role === BoardMembership.Roles.VIEWER) {
      if (_.isNil(inputs.values.canComment)) {
        inputs.values.canComment = false; // eslint-disable-line no-param-reassign
      }
    }

    const boardMembership = await BoardMembership.create({
      ...inputs.values,
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
