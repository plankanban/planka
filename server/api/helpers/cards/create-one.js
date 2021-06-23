module.exports = {
  inputs: {
    values: {
      type: 'json',
      custom: (value) => {
        if (!_.isPlainObject(value)) {
          return false;
        }

        if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
          return false;
        }

        return true;
      },
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
    list: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    listMustBePresent: {},
    listMustBelongToBoard: {},
    positionMustBeInValues: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (inputs.board.type === Board.Types.KANBAN) {
      if (!inputs.list) {
        throw 'listMustBePresent';
      }

      if (inputs.list.boardId !== inputs.board.id) {
        throw 'listMustBelongToBoard';
      }

      values.listId = inputs.list.id;

      if (_.isUndefined(values.position)) {
        throw 'positionMustBeInValues';
      }

      const cards = await sails.helpers.lists.getCards(inputs.list.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
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

        sails.sockets.broadcast(`board:${inputs.board.id}`, 'cardUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });

      values.position = position;
    } else if (inputs.board.type === Board.Types.COLLECTION) {
      delete values.position;
    }

    const card = await Card.create({
      ...values,
      boardId: inputs.board.id,
      creatorUserId: inputs.user.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${card.boardId}`,
      'cardCreate',
      {
        item: card,
      },
      inputs.request,
    );

    if (inputs.user.subscribeToOwnCards) {
      await CardSubscription.create({
        cardId: card.id,
        userId: inputs.user.id,
      }).tolerate('E_UNIQUE');

      sails.sockets.broadcast(`user:${inputs.user.id}`, 'cardUpdate', {
        item: {
          id: card.id,
          isSubscribed: true,
        },
      });
    }

    await sails.helpers.actions.createOne(
      {
        type: Action.Types.CREATE_CARD,
        data: {
          list: _.pick(inputs.list, ['id', 'name']),
        },
      },
      inputs.user,
      card,
    );

    return card;
  },
};
