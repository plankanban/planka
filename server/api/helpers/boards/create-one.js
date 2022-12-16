module.exports = {
  inputs: {
    values: {
      type: 'json',
      custom: (value) => _.isPlainObject(value) && _.isFinite(value.position),
      required: true,
    },
    import: {
      type: 'json',
      custom: (value) =>
        value.type &&
        Object.values(Board.ImportTypes).includes(value.type) &&
        _.isPlainObject(value.board),
    },
    user: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const managerUserIds = await sails.helpers.projects.getManagerUserIds(inputs.project.id);
    const boards = await sails.helpers.projects.getBoards(inputs.project.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      inputs.values.position,
      boards,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Board.update({
        id,
        projectId: inputs.project.id,
      }).set({
        position: nextPosition,
      });

      const memberUserIds = await sails.helpers.boards.getMemberUserIds(id);
      const userIds = _.union(managerUserIds, memberUserIds);

      userIds.forEach((userId) => {
        sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    });

    const board = await Board.create({
      ...inputs.values,
      position,
      projectId: inputs.project.id,
    }).fetch();

    if (inputs.import && inputs.import.type === Board.ImportTypes.TRELLO) {
      await sails.helpers.boards.importFromTrello(inputs.user, board, inputs.import.board);
    }

    const boardMembership = await BoardMembership.create({
      boardId: board.id,
      userId: inputs.user.id,
      role: BoardMembership.Roles.EDITOR,
    }).fetch();

    managerUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'boardCreate',
        {
          item: board,
          requestId: inputs.requestId,
        },
        inputs.request,
      );
    });

    return {
      board,
      boardMembership,
    };
  },
};
