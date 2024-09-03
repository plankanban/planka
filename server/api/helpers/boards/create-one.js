const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.project)) {
    return false;
  }

  return true;
};

const importValidator = (value) => {
  if (!value.type || !Object.values(Board.ImportTypes).includes(value.type)) {
    return false;
  }

  if (!_.isPlainObject(value.board)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    import: {
      type: 'json',
      custom: importValidator,
    },
    actorUser: {
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
    const { values } = inputs;

    const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(values.project.id);
    const boards = await sails.helpers.projects.getBoards(values.project.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      boards,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Board.update({
        id,
        projectId: values.project.id,
      }).set({
        position: nextPosition,
      });

      // TODO: move out of loop
      const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(id);
      const boardRelatedUserIds = _.union(projectManagerUserIds, boardMemberUserIds);

      boardRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });

        // TODO: send webhooks
      });
    });

    const board = await Board.create({
      ...values,
      position,
      projectId: values.project.id,
    }).fetch();

    if (inputs.import && inputs.import.type === Board.ImportTypes.TRELLO) {
      await sails.helpers.boards.importFromTrello(board, inputs.import.board, inputs.actorUser);
    }

    const boardMembership = await BoardMembership.create({
      boardId: board.id,
      userId: inputs.actorUser.id,
      role: BoardMembership.Roles.EDITOR,
    }).fetch();

    projectManagerUserIds.forEach((userId) => {
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

    sails.helpers.utils.sendWebhooks.with({
      event: 'boardCreate',
      data: {
        item: board,
        included: {
          projects: [values.project],
        },
      },
      user: inputs.actorUser,
    });

    return {
      board,
      boardMembership,
    };
  },
};
