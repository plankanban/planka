module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
    },
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
    request: {
      type: 'ref',
    },
  },

  exits: {
    listMustBePresent: {},
    listMustBelongToBoard: {},
    positionMustBeInValues: {},
  },

  async fn(inputs, exits) {
    const { values } = inputs;

    values.boardId = inputs.board.id;

    if (inputs.board.type === 'kanban') {
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

        sails.sockets.broadcast(`board:${inputs.board.id}`, 'cardUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });

      values.position = position;
    } else if (inputs.board.type === 'collection') {
      delete values.position;
    }

    const card = await Card.create(values).fetch();

    if (inputs.user.subscribeToOwnCards) {
      await CardSubscription.create({
        cardId: card.id,
        userId: inputs.user.id,
      }).tolerate('E_UNIQUE');

      card.isSubscribed = true;
    } else {
      card.isSubscribed = false;
    }

    // FIXME: broadcast subscription separately
    sails.sockets.broadcast(
      `board:${card.boardId}`,
      'cardCreate',
      {
        item: card,
        included: {
          cardMemberships: [],
          cardLabels: [],
          tasks: [],
          attachments: [],
        },
      },
      inputs.request,
    );

    await sails.helpers.createAction(card, inputs.user, {
      type: 'createCard',
      data: {
        list: _.pick(inputs.list, ['id', 'name']),
      },
    });

    return exits.success(card);
  },
};
