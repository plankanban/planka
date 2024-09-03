const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
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

  async fn(inputs) {
    const { values } = inputs;

    const tasks = await sails.helpers.cards.getTasks(values.card.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      tasks,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Task.update({
        id,
        cardId: values.card.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${values.card.boardId}`, 'taskUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });

      // TODO: send webhooks
    });

    const task = await Task.create({
      ...values,
      position,
      cardId: values.card.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${values.card.boardId}`,
      'taskCreate',
      {
        item: task,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'taskCreate',
      data: {
        item: task,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      },
      user: inputs.actorUser,
    });

    return task;
  },
};
