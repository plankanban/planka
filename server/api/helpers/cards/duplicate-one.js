const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.creatorUser)) {
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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const cards = await sails.helpers.lists.getCards(inputs.record.listId);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      cards,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Card.update({
        id,
        listId: inputs.record.listId,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${inputs.record.boardId}`, 'cardUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });

      // TODO: send webhooks
    });

    const card = await Card.create({
      ..._.pick(inputs.record, [
        'boardId',
        'listId',
        'name',
        'description',
        'dueDate',
        'stopwatch',
      ]),
      ...values,
      position,
      creatorUserId: values.creatorUser.id,
    }).fetch();

    const cardMemberships = await sails.helpers.cards.getCardMemberships(inputs.record.id);
    const cardMembershipsValues = cardMemberships.map((cardMembership) => ({
      ..._.pick(cardMembership, ['userId']),
      cardId: card.id,
    }));
    const nextCardMemberships = await CardMembership.createEach(cardMembershipsValues).fetch();

    const cardLabels = await sails.helpers.cards.getCardLabels(inputs.record.id);
    const cardLabelsValues = cardLabels.map((cardLabel) => ({
      ..._.pick(cardLabel, ['labelId']),
      cardId: card.id,
    }));
    const nextCardLabels = await CardLabel.createEach(cardLabelsValues).fetch();

    const tasks = await sails.helpers.cards.getTasks(inputs.record.id);
    const tasksValues = tasks.map((task) => ({
      ..._.pick(task, ['position', 'name', 'isCompleted']),
      cardId: card.id,
    }));
    const nextTasks = await Task.createEach(tasksValues).fetch();

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
          lists: [inputs.list],
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
        type: Action.Types.CREATE_CARD, // TODO: introduce separate type?
        data: {
          list: _.pick(inputs.list, ['id', 'name']),
        },
        user: values.creatorUser,
      },
      project: inputs.project,
      board: inputs.board,
      list: inputs.list,
      request: inputs.request,
    });

    return {
      card,
      cardMemberships: nextCardMemberships,
      cardLabels: nextCardLabels,
      tasks: nextTasks,
    };
  },
};
