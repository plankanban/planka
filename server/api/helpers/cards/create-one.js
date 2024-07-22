const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.list)) {
    return false;
  }

  if (!_.isPlainObject(value.creatorUser)) {
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
    board: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    positionMustBeInValues: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (_.isUndefined(values.position)) {
      throw 'positionMustBeInValues';
    }

    const cards = await sails.helpers.lists.getCards(values.list.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      cards,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Card.update({
        id,
        listId: values.list.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${values.list.boardId}`, 'cardUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });

      // TODO: send webhooks
    });

    const card = await Card.create({
      ...values,
      position,
      boardId: values.list.boardId,
      listId: values.list.id,
      creatorUserId: values.creatorUser.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${card.boardId}`,
      'cardCreate',
      {
        item: card,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'cardCreate',
      data: {
        item: card,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [values.list],
        },
      },
      user: values.creatorUser,
    });

    if (values.creatorUser.subscribeToOwnCards) {
      await CardSubscription.create({
        cardId: card.id,
        userId: card.creatorUserId,
      }).tolerate('E_UNIQUE');

      sails.sockets.broadcast(`user:${card.creatorUserId}`, 'cardUpdate', {
        item: {
          id: card.id,
          isSubscribed: true,
        },
      });

      // TODO: send webhooks
    }

    await sails.helpers.actions.createOne.with({
      values: {
        card,
        type: Action.Types.CREATE_CARD,
        data: {
          list: _.pick(values.list, ['id', 'name']),
        },
        user: values.creatorUser,
      },
      project: inputs.project,
      board: inputs.board,
      list: values.list,
      request: inputs.request,
    });

    return card;
  },
};
