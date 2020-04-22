module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: (value) =>
        _.isPlainObject(value) && (_.isUndefined(value.position) || _.isFinite(value.position)),
      required: true,
    },
    toList: {
      type: 'ref',
    },
    list: {
      type: 'ref',
    },
    user: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    invalidParams: {},
  },

  async fn(inputs, exits) {
    const { isSubscribed, ...values } = inputs.values;

    if (inputs.toList) {
      if (!inputs.list || !inputs.user) {
        throw 'invalidParams';
      }

      if (inputs.toList.id === inputs.list.id) {
        delete inputs.toList; // eslint-disable-line no-param-reassign
      } else {
        values.listId = inputs.toList.id;
      }
    }

    if (!_.isUndefined(isSubscribed) && !inputs.user) {
      throw 'invalidParams';
    }

    if (!_.isUndefined(values.position)) {
      const cards = await sails.helpers.getCardsForList(
        values.listId || inputs.record.listId,
        inputs.record.id,
      );

      const { position, repositions } = sails.helpers.insertToPositionables(values.position, cards);

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await Card.update({
          id,
          listId,
        }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`board:${inputs.record.boardId}`, 'cardUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    }

    let card;
    if (!_.isEmpty(values)) {
      card = await Card.updateOne(inputs.record.id).set(values);

      if (!card) {
        return exits.success(card);
      }

      sails.sockets.broadcast(
        `board:${card.boardId}`,
        'cardUpdate',
        {
          item: card,
        },
        inputs.request,
      );

      if (inputs.toList) {
        await sails.helpers.createAction(card, inputs.user, {
          type: 'moveCard',
          data: {
            fromList: _.pick(inputs.list, ['id', 'name']),
            toList: _.pick(inputs.toList, ['id', 'name']),
          },
        });
      }
    } else {
      card = inputs.record;
    }

    if (!_.isUndefined(isSubscribed)) {
      const cardSubscription = await CardSubscription.findOne({
        cardId: card.id,
        userId: inputs.user.id,
      });

      if (isSubscribed !== !!cardSubscription) {
        if (isSubscribed) {
          await CardSubscription.create({
            cardId: card.id,
            userId: inputs.user.id,
          }).tolerate('E_UNIQUE');
        } else {
          await CardSubscription.destroyOne({
            cardId: card.id,
            userId: inputs.user.id,
          });
        }

        sails.sockets.broadcast(
          `user:${inputs.user.id}`,
          'cardUpdate',
          {
            item: {
              isSubscribed,
              id: card.id,
            },
          },
          inputs.request,
        );
      }
    }

    return exits.success(card);
  },
};
