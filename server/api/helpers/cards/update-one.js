const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
    return false;
  }

  if (!_.isUndefined(value.board)) {
    if (!_.isPlainObject(value.project)) {
      return false;
    }

    if (!_.isPlainObject(value.board)) {
      return false;
    }
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
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    positionMustBeInValues: {},
    boardInValuesMustBelongToProject: {},
    listMustBeInValues: {},
    listInValuesMustBelongToBoard: {},
  },

  async fn(inputs) {
    const { isSubscribed, ...values } = inputs.values;

    if (values.project && values.project.id === inputs.project.id) {
      delete values.project;
    }

    const project = values.project || inputs.project;

    if (values.board) {
      if (values.board.projectId !== project.id) {
        throw 'boardInValuesMustBelongToProject';
      }

      if (values.board.id === inputs.board.id) {
        delete values.board;
      } else {
        values.boardId = values.board.id;
      }
    }

    const board = values.board || inputs.board;

    if (values.list) {
      if (values.list.boardId !== board.id) {
        throw 'listInValuesMustBelongToBoard';
      }

      if (values.list.id === inputs.list.id) {
        delete values.list;
      } else {
        values.listId = values.list.id;
      }
    } else if (values.board) {
      throw 'listMustBeInValues';
    }

    const list = values.list || inputs.list;

    if (values.list && _.isUndefined(values.position)) {
      throw 'positionMustBeInValues';
    }

    if (!_.isUndefined(values.position)) {
      const cards = await sails.helpers.lists.getCards(list.id, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        cards,
      );

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await Card.update({
          id,
          listId: list.id,
        }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`board:${board.id}`, 'cardUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });

        // TODO: send webhooks
      });
    }

    const dueDate = _.isUndefined(values.dueDate) ? inputs.record.dueDate : values.dueDate;

    if (dueDate) {
      const isDueDateCompleted = _.isUndefined(values.isDueDateCompleted)
        ? inputs.record.isDueDateCompleted
        : values.isDueDateCompleted;

      if (_.isNull(isDueDateCompleted)) {
        values.isDueDateCompleted = false;
      }
    } else {
      values.isDueDateCompleted = null;
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
              project,
              values: {
                ..._.omit(label, ['id', 'boardId']),
                board: values.board,
              },
              actorUser: inputs.actorUser,
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

        sails.sockets.broadcast(
          `board:${inputs.record.boardId}`,
          'cardDelete', // TODO: introduce separate event
          {
            item: inputs.record,
          },
          inputs.request,
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

          // TODO: send webhooks
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

      sails.helpers.utils.sendWebhooks.with({
        event: 'cardUpdate',
        data: {
          item: card,
          included: {
            projects: [project],
            boards: [board],
            lists: [list],
          },
        },
        prevData: {
          item: inputs.record,
        },
        user: inputs.actorUser,
      });

      if (!values.board && values.list) {
        await sails.helpers.actions.createOne.with({
          project,
          board,
          list,
          values: {
            card,
            user: inputs.actorUser,
            type: Action.Types.MOVE_CARD,
            data: {
              fromList: _.pick(inputs.list, ['id', 'name']),
              toList: _.pick(values.list, ['id', 'name']),
            },
          },
          request: inputs.request,
        });
      }

      // TODO: add transfer action
    }

    if (!_.isUndefined(isSubscribed)) {
      const prevIsSubscribed = await sails.helpers.users.isCardSubscriber(
        inputs.actorUser.id,
        card.id,
      );

      if (isSubscribed !== prevIsSubscribed) {
        if (isSubscribed) {
          await CardSubscription.create({
            cardId: card.id,
            userId: inputs.actorUser.id,
          }).tolerate('E_UNIQUE');
        } else {
          await CardSubscription.destroyOne({
            cardId: card.id,
            userId: inputs.actorUser.id,
          });
        }

        sails.sockets.broadcast(
          `user:${inputs.actorUser.id}`,
          'cardUpdate',
          {
            item: {
              isSubscribed,
              id: card.id,
            },
          },
          inputs.request,
        );

        // TODO: send webhooks
      }
    }

    return card;
  },
};
