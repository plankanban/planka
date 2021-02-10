module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    toBoard: {
      type: 'ref',
    },
    toList: {
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
    board: {
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
    boardMustBePresent: {},
    listMustBePresent: {},
    toListMustBelongToBoard: {},
    toListMustBePresent: {},
    positionMustBeInValues: {},
    userMustBePresent: {},
  },

  async fn(inputs, exits) {
    const { isSubscribed, ...values } = inputs.values;

    if (inputs.toBoard || inputs.toList || !_.isUndefined(values.position)) {
      if (!inputs.board) {
        throw 'boardMustBePresent';
      }

      if (inputs.toBoard) {
        if (inputs.toBoard.id === inputs.board.id) {
          delete inputs.toBoard; // eslint-disable-line no-param-reassign
        } else {
          values.boardId = inputs.toBoard.id;
        }
      }

      const board = inputs.toBoard || inputs.board;

      if (inputs.toList) {
        if (inputs.board.type === 'kanban' && !inputs.list) {
          throw 'listMustBePresent';
        }

        if (inputs.toList.boardId !== board.id) {
          throw 'toListMustBelongToBoard';
        }

        if (
          board.type === 'collection' ||
          (inputs.board.type === 'kanban' && inputs.toList.id === inputs.list.id)
        ) {
          delete inputs.toList; // eslint-disable-line no-param-reassign
        } else {
          values.listId = inputs.toList.id;
        }
      }

      if (inputs.toList) {
        if (_.isUndefined(values.position)) {
          throw 'positionMustBeInValues';
        }
      } else if (inputs.toBoard) {
        if (inputs.toBoard.type === 'kanban') {
          throw 'toListMustBePresent';
        }

        if (inputs.board.type === 'kanban') {
          values.listId = null;
          values.position = null;
        }
      }
    }

    if ((!_.isUndefined(isSubscribed) || inputs.toBoard || inputs.toList) && !inputs.user) {
      throw 'userMustBePresent';
    }

    if (!_.isNil(values.position)) {
      const boardId = values.boardId || inputs.record.boardId;
      const listId = values.listId || inputs.record.listId;

      const cards = await sails.helpers.getCardsForList(listId, inputs.record.id);
      const { position, repositions } = sails.helpers.insertToPositionables(values.position, cards);

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
      if (inputs.toBoard) {
        if (inputs.toBoard.projectId !== inputs.board.projectId) {
          const userIds = await sails.helpers.getMembershipUserIdsForProject(
            inputs.toBoard.projectId,
          );

          await CardSubscription.destroy({
            cardId: inputs.record.id,
            userId: {
              '!=': userIds,
            },
          });

          await CardMembership.destroy({
            cardId: inputs.record.id,
            userId: {
              '!=': userIds,
            },
          });
        }

        prevLabels = await sails.helpers.getLabelsForCard(inputs.record.id);

        await CardLabel.destroy({
          cardId: inputs.record.id,
        });
      }

      card = await Card.updateOne(inputs.record.id).set(values);

      if (!card) {
        return exits.success(card);
      }

      if (inputs.toBoard) {
        sails.sockets.broadcast(
          `board:${inputs.board.id}`,
          'cardDelete',
          {
            item: inputs.record,
          },
          inputs.request,
        );

        const labels = await sails.helpers.getLabelsForBoard(card.boardId);
        const labelByNameMap = _.keyBy(labels, 'name');

        const labelIds = await Promise.all(
          prevLabels.map(async (prevLabel) => {
            if (labelByNameMap[prevLabel.name]) {
              return labelByNameMap[prevLabel.name].id;
            }

            const { id } = await sails.helpers.createLabel(
              inputs.toBoard,
              _.omit(prevLabel, ['id', 'boardId']),
            );

            return id;
          }),
        );

        await Promise.all(
          labelIds.map(async (labelId) => {
            await CardLabel.create({
              labelId,
              cardId: card.id,
            })
              .tolerate('E_UNIQUE')
              .fetch();
          }),
        );

        const cardMemberships = await sails.helpers.getMembershipsForCard(card.id);
        const cardLabels = await sails.helpers.getCardLabelsForCard(card.id);
        const tasks = await sails.helpers.getTasksForCard(card.id);
        const attachments = await sails.helpers.getAttachmentsForCard(card.id);

        sails.sockets.broadcast(`board:${card.boardId}`, 'cardCreate', {
          item: card,
          included: {
            cardMemberships,
            cardLabels,
            tasks,
            attachments,
          },
        });

        const userIds = await sails.helpers.getSubscriptionUserIdsForCard(card.id);

        userIds.forEach((userId) => {
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

      if (!inputs.toBoard && inputs.toList) {
        // TODO: add transfer action
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
