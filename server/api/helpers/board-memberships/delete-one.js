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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const cardIds = await sails.helpers.boards.getCardIds(inputs.record.boardId);

    await CardSubscription.destroy({
      cardId: cardIds,
      userId: inputs.record.userId,
    });

    await CardMembership.destroy({
      cardId: cardIds,
      userId: inputs.record.userId,
    });

    const boardMembership = await BoardMembership.destroyOne(inputs.record.id);

    if (boardMembership) {
      sails.sockets.broadcast(
        `user:${boardMembership.userId}`,
        'boardMembershipDelete',
        {
          item: boardMembership,
        },
        inputs.request,
      );

      const notifyBoard = () => {
        sails.sockets.broadcast(
          `board:${boardMembership.boardId}`,
          'boardMembershipDelete',
          {
            item: boardMembership,
          },
          inputs.request,
        );
      };

      const isProjectManager = await sails.helpers.users.isProjectManager(
        inputs.record.userId,
        inputs.project.id,
      );

      if (isProjectManager) {
        notifyBoard();
      } else {
        // TODO: also remove if unsubscribed to user
        sails.sockets.removeRoomMembersFromRooms(
          `user:${boardMembership.userId}`,
          `board:${boardMembership.boardId}`,
          notifyBoard,
        );
      }
    }

    return boardMembership;
  },
};
