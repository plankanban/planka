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
    const boards = await sails.helpers.getBoardsForProject(
      inputs.record.projectId
    );

    const boardIds = sails.helpers.mapRecords(boards);

    const cards = await sails.helpers.getCardsForBoard(boardIds);
    const cardIds = sails.helpers.mapRecords(cards);

    await CardSubscription.destroy({
      cardId: cardIds,
      userId: inputs.record.userId
    });

    await CardMembership.destroy({
      cardId: cardIds,
      userId: inputs.record.userId
    });

    const projectMembership = await ProjectMembership.destroyOne(
      inputs.record.id
    );

    if (projectMembership) {
      const userIds = await sails.helpers.getMembershipUserIdsForProject(
        projectMembership.projectId
      );

      userIds.forEach(userId => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectMembershipDelete',
          {
            item: projectMembership
          },
          inputs.request
        );
      });

      sails.sockets.removeRoomMembersFromRooms(
        `user:${projectMembership.userId}`,
        boardIds.map(boardId => `board:${boardId}`)
      );

      const project = await Project.findOne(projectMembership.projectId);

      sails.sockets.broadcast(
        `user:${projectMembership.userId}`,
        'projectDelete',
        {
          item: project
        }
      );
    }

    return exits.success(projectMembership);
  }
};
