const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: valuesValidator,
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

  async fn(inputs) {
    const { values } = inputs;

    if (!_.isUndefined(values.position)) {
      const lists = await sails.helpers.boards.getLists(inputs.record.boardId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        lists,
      );

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await List.update({
          id,
          boardId: inputs.record.boardId,
        }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`board:${inputs.record.boardId}`, 'listUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    }

    const list = await List.updateOne(inputs.record.id).set({ ...values });

    if (list) {
      sails.sockets.broadcast(
        `board:${list.boardId}`,
        'listUpdate',
        {
          item: list,
        },
        inputs.request,
      );

      await sails.helpers.utils.sendWebhook.with({
        event: 'LIST_UPDATE',
        data: list,
        projectId: inputs.board.projectId,
        user: inputs.request.currentUser,
        board: inputs.board,
      });
    }

    return list;
  },
};
