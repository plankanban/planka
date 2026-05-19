/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const supabase = require('../../../utils/supabase');

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

    supabase
      .logEvent({
        cardId: values.card.id,
        eventType: 'label_add',
        data: { label: _.pick(values.label, ['id', 'name', 'color']) },
        userEmail: inputs.actorUser && inputs.actorUser.email,
        userId: inputs.actorUser && inputs.actorUser.id,
      })
      .catch(() => undefined);

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

    await sails.helpers.actions.createOne.with({
      webhooks,
      values: {
        card: values.card,
        type: Action.Types.ADD_LABEL_TO_CARD,
        data: {
          label: _.pick(values.label, ['id', 'name', 'color']),
        },
        user: inputs.actorUser,
      },
      project: inputs.project,
      board: inputs.board,
      list: inputs.list,
    });

    return cardLabel;
  },
};
