const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
    return false;
  }

  if (!_.isUndefined(value.board) && !_.isPlainObject(value.board)) {
    return false;
  }

  if (!_.isUndefined(value.list) && !_.isPlainObject(value.list)) {
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
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    user: {
      type: 'ref',
    },
    board: {
      type: 'ref',
    },
    list: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    positionMustBeInValues: {},
    listMustBeInValues: {},
    listInValuesMustBelongToBoard: {},
    userMustBePresent: {},
    boardMustBePresent: {},
    listMustBePresent: {},
  },

  async fn(inputs) {
    const { isSubscribed, ...values } = inputs.values;

    if (values.board || values.list || !_.isUndefined(values.position)) {
      if (!inputs.board) {
        throw 'boardMustBePresent';
      }

      if (values.board) {
        if (values.board.id === inputs.board.id) {
          delete values.board;
        } else {
          values.boardId = values.board.id;
        }
      }

      const board = values.board || inputs.board;

      if (values.list) {
        if (!inputs.list) {
          throw 'listMustBePresent';
        }

        if (values.list.boardId !== board.id) {
          throw 'listInValuesMustBelongToBoard';
        }

        if (values.list.id === inputs.list.id) {
          delete values.list;
        } else {
          values.listId = values.list.id;
        }
      }

      if (values.list) {
        if (_.isUndefined(values.position)) {
          throw 'positionMustBeInValues';
        }
      } else if (values.board) {
        throw 'listMustBeInValues';
      }
    }

    if ((!_.isUndefined(isSubscribed) || values.board || values.list) && !inputs.user) {
      throw 'userMustBePresent';
    }

    if (!_.isUndefined(values.position)) {
      const boardId = values.boardId || inputs.record.boardId;
      const listId = values.listId || inputs.record.listId;

      const cards = await sails.helpers.lists.getCards(listId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        cards,
      );

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await Card.update({
          id,
          listId,
        }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`board:${boardId}`, 'cardUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    }

    let card;
    if (_.isEmpty(values)) {
      card = inputs.record;
    } else {
      let prevLabels;
      if (values.board) {
        const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(values.board.id);

        await CardSubscription.destroy({
          cardId: inputs.record.id,
          userId: {
            '!=': boardMemberUserIds,
          },
        });

        await CardMembership.destroy({
          cardId: inputs.record.id,
          userId: {
            '!=': boardMemberUserIds,
          },
        });

        prevLabels = await sails.helpers.cards.getLabels(inputs.record.id);

        await CardLabel.destroy({
          cardId: inputs.record.id,
        });
      }

      card = await Card.updateOne(inputs.record.id).set({ ...values });

      if (!card) {
        return card;
      }

      if (values.board) {
        const labels = await sails.helpers.boards.getLabels(card.boardId);
        const labelByName = _.keyBy(labels, 'name');

        const labelIds = await Promise.all(
          prevLabels.map(async (label) => {
            if (labelByName[label.name]) {
              return labelByName[label.name].id;
            }

            const { id } = await sails.helpers.labels.createOne.with({
              values: {
                ..._.omit(label, ['id', 'boardId']),
                board: values.board,
              },
            });

            return id;
          }),
        );

        await Promise.all(
          labelIds.map(async (labelId) =>
            CardLabel.create({
              labelId,
              cardId: card.id,
            })
              .tolerate('E_UNIQUE')
              .fetch(),
          ),
        );

        sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
          item: card,
        });

        const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(card.id);

        subscriptionUserIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'cardUpdate', {
            item: {
              id: card.id,
              isSubscribed: true,
            },
          });
        });
      } else {
        sails.sockets.broadcast(
          `board:${card.boardId}`,
          'cardUpdate',
          {
            item: card,
          },
          inputs.request,
        );
      }

      if (!values.board && values.list) {
        await sails.helpers.actions.createOne.with({
          values: {
            card,
            user: inputs.user,
            type: Action.Types.MOVE_CARD,
            data: {
              fromList: _.pick(inputs.list, ['id', 'name']),
              toList: _.pick(values.list, ['id', 'name']),
            },
          },
        });
      }

      // TODO: add transfer action
    }

    if (!_.isUndefined(isSubscribed)) {
      const prevIsSubscribed = await sails.helpers.users.isCardSubscriber(inputs.user.id, card.id);

      if (isSubscribed !== prevIsSubscribed) {
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

    return card;
  },
};
