/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'ref',
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
    labelAlreadyInCard: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    let cardLabel;
    try {
      cardLabel = await CardLabel.qm.createOne({
        ...values,
        cardId: values.card.id,
        labelId: values.label.id,
      });
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'labelAlreadyInCard';
      }

      throw error;
    }

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'cardLabelCreate',
      {
        item: cardLabel,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CARD_LABEL_CREATE,
      buildData: () => ({
        item: cardLabel,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          labels: [values.label],
          lists: [inputs.list],
          cards: [values.card],
        },
      }),
      user: inputs.actorUser,
    });

    return cardLabel;
  },
};
