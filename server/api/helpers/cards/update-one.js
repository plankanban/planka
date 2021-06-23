module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
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
      defaultsTo: {},
    },
    nextBoard: {
      type: 'ref',
    },
    nextList: {
      type: 'ref',
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
    boardMustBePresent: {},
    listMustBePresent: {},
    nextListMustBelongToBoard: {},
    nextListMustBePresent: {},
    positionMustBeInValues: {},
    userMustBePresent: {},
  },

  async fn(inputs) {
    const { isSubscribed, ...values } = inputs.values;

    if (inputs.nextBoard || inputs.nextList || !_.isUndefined(values.position)) {
      if (!inputs.board) {
        throw 'boardMustBePresent';
      }

      if (inputs.nextBoard) {
        if (inputs.nextBoard.id === inputs.board.id) {
          delete inputs.nextBoard; // eslint-disable-line no-param-reassign
        } else {
          values.boardId = inputs.nextBoard.id;
        }
      }

      const board = inputs.nextBoard || inputs.board;

      if (inputs.nextList) {
        if (inputs.board.type === Board.Types.KANBAN && !inputs.list) {
          throw 'listMustBePresent';
        }

        if (inputs.nextList.boardId !== board.id) {
          throw 'nextListMustBelongToBoard';
        }

        if (
          board.type === Board.Types.COLLECTION ||
          (inputs.board.type === Board.Types.KANBAN && inputs.nextList.id === inputs.list.id)
        ) {
          delete inputs.nextList; // eslint-disable-line no-param-reassign
        } else {
          values.listId = inputs.nextList.id;
        }
      }

      if (inputs.nextList) {
        if (_.isUndefined(values.position)) {
          throw 'positionMustBeInValues';
        }
      } else if (inputs.nextBoard) {
        if (inputs.nextBoard.type === Board.Types.KANBAN) {
          throw 'nextListMustBePresent';
        }

        if (inputs.board.type === Board.Types.KANBAN) {
          values.listId = null;
          values.position = null;
        }
      }
    }

    if ((!_.isUndefined(isSubscribed) || inputs.nextBoard || inputs.nextList) && !inputs.user) {
      throw 'userMustBePresent';
    }

    if (!_.isNil(values.position)) {
      const boardId = values.boardId || inputs.record.boardId;
      const listId = values.listId || inputs.record.listId;

      const cards = await sails.helpers.lists.getCards(listId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        cards,
      );

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

      values.position = position;
    }

    let card;
    if (!_.isEmpty(values)) {
      let prevLabels;
      if (inputs.nextBoard) {
        if (inputs.nextBoard.projectId !== inputs.board.projectId) {
          const memberUserIds = await sails.helpers.boards.getMemberUserIds(inputs.nextBoard.id);

          await CardSubscription.destroy({
            cardId: inputs.record.id,
            userId: {
              '!=': memberUserIds,
            },
          });

          await CardMembership.destroy({
            cardId: inputs.record.id,
            userId: {
              '!=': memberUserIds,
            },
          });
        }

        prevLabels = await sails.helpers.cards.getLabels(inputs.record.id);

        await CardLabel.destroy({
          cardId: inputs.record.id,
        });
      }

      card = await Card.updateOne(inputs.record.id).set(values);

      if (!card) {
        return card;
      }

      if (inputs.nextBoard) {
        const labels = await sails.helpers.boards.getLabels(card.boardId);
        const labelByNameMap = _.keyBy(labels, 'name');

        const labelIds = await Promise.all(
          prevLabels.map(async (prevLabel) => {
            if (labelByNameMap[prevLabel.name]) {
              return labelByNameMap[prevLabel.name].id;
            }

            const { id } = await sails.helpers.labels.createOne(
              _.omit(prevLabel, ['id', 'boardId']),
              inputs.nextBoard,
            );

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

      if (!inputs.nextBoard && inputs.nextList) {
        // TODO: add transfer action
        await sails.helpers.actions.createOne(
          {
            type: Action.Types.MOVE_CARD,
            data: {
              fromList: _.pick(inputs.list, ['id', 'name']),
              toList: _.pick(inputs.nextList, ['id', 'name']),
            },
          },
          inputs.user,
          card,
        );
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

    return card;
  },
};
