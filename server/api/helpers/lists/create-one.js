module.exports = {
  inputs: {
    values: {
      type: 'json',
      custom: (value) => _.isPlainObject(value) && _.isFinite(value.position),
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
    const lists = await sails.helpers.boards.getLists(inputs.board.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      inputs.values.position,
      lists,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await List.update({
        id,
        boardId: inputs.board.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${inputs.board.id}`, 'listUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const list = await List.create({
      ...inputs.values,
      position,
      boardId: inputs.board.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${list.boardId}`,
      'listCreate',
      {
        item: list,
      },
      inputs.request,
    );

    return list;
  },
};
