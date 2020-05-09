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
    toBoard: {
      type: 'ref',
    },
    list: {
      type: 'ref',
    },
    board: {
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

        if (inputs.toBoard) {
          if (!inputs.board) {
            throw 'invalidParams';
          }

          if (inputs.toBoard.id === inputs.board.id) {
            delete inputs.toList; // eslint-disable-line no-param-reassign
          } else {
            values.boardId = inputs.toBoard.id;
          }
        }
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
      let prevLabels;
      if (inputs.toList && inputs.toBoard) {
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

      if (inputs.toList && inputs.toBoard) {
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

      if (inputs.toList) {
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
