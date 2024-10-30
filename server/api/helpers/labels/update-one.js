const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
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
      type: 'json',
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

    if (!_.isUndefined(values.position)) {
      const labels = await sails.helpers.boards.getLabels(inputs.record.boardId, inputs.record.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        labels,
      );

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await Label.update({
          id,
          boardId: inputs.record.boardId,
        }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`board:${inputs.record.boardId}`, 'labelUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });

        // TODO: send webhooks
      });
    }

    const label = await Label.updateOne(inputs.record.id).set({ ...values });

    if (label) {
      sails.sockets.broadcast(
        `board:${label.boardId}`,
        'labelUpdate',
        {
          item: label,
        },
        inputs.request,
      );

      sails.helpers.utils.sendWebhooks.with({
        event: 'labelUpdate',
        data: {
          item: label,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
          },
        },
        prevData: {
          item: inputs.record,
        },
        user: inputs.actorUser,
      });
    }

    return label;
  },
};
