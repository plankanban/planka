module.exports = {
  inputs: {
    list: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: (value) => _.isPlainObject(value) && _.isFinite(value.position),
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs, exits) {
    const cards = await sails.helpers.getCardsForList(inputs.list.id);

    const { position, repositions } = sails.helpers.insertToPositionables(
      inputs.values.position,
      cards,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Card.update({
        id,
        listId: inputs.list.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${list.boardId}`, 'cardUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const card = await Card.create({
      ...inputs.values,
      position,
      listId: inputs.list.id,
      boardId: inputs.list.boardId,
    }).fetch();

    sails.sockets.broadcast(
      `board:${card.boardId}`,
      'cardCreate',
      {
        item: card,
      },
      inputs.request,
    );

    const values = {
      type: 'createCard',
      data: {
        list: _.pick(inputs.list, ['id', 'name']),
      },
    };

    await sails.helpers.createAction(card, inputs.user, values);

    return exits.success(card);
  },
};
