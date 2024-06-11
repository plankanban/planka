const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isFinite(value.position)) {
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
    const { values } = inputs;

    const lists = await sails.helpers.boards.getLists(values.board.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      lists,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await List.update({
        id,
        boardId: values.board.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${values.board.id}`, 'listUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });

      // TODO: send webhooks
    });

    const list = await List.create({
      ...values,
      position,
      boardId: values.board.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${list.boardId}`,
      'listCreate',
      {
        item: list,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'listCreate',
      data: {
        item: list,
        included: {
          projects: [inputs.project],
          boards: [values.board],
        },
      },
      user: inputs.actorUser,
    });

    return list;
  },
};
