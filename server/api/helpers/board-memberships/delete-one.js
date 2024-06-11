const { v4: uuid } = require('uuid');

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
    board: {
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
      const notify = (room) => {
        sails.sockets.broadcast(
          room,
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

      if (!isProjectManager) {
        sails.sockets.removeRoomMembersFromRooms(
          `@user:${boardMembership.userId}`,
          `board:${boardMembership.boardId}`,
          () => {
            notify(`board:${boardMembership.boardId}`);
          },
        );
      }

      notify(`user:${boardMembership.userId}`);

      if (isProjectManager) {
        const tempRoom = uuid();

        sails.sockets.addRoomMembersToRooms(`board:${boardMembership.boardId}`, tempRoom, () => {
          sails.sockets.removeRoomMembersFromRooms(
            `user:${boardMembership.userId}`,
            tempRoom,
            () => {
              notify(tempRoom);
              sails.sockets.removeRoomMembersFromRooms(tempRoom, tempRoom);
            },
          );
        });
      }

      sails.helpers.utils.sendWebhooks.with({
        event: 'boardMembershipDelete',
        data: {
          item: boardMembership,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
          },
        },
        user: inputs.actorUser,
      });
    }

    return boardMembership;
  },
};
