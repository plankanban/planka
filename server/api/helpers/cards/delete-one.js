/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const supabase = require('../../../utils/supabase');

module.exports = {
  inputs: {
    record: {
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

  async fn(inputs) {
    await sails.helpers.cards.deleteRelated(inputs.record);

    const card = await Card.qm.deleteOne(inputs.record.id);

    if (card) {
      supabase.markCardDeleted(card.id).catch(() => undefined);
      supabase
        .logEvent({
          cardId: card.id,
          eventType: 'delete',
          data: { name: card.name },
          userEmail: inputs.actorUser && inputs.actorUser.email,
          userId: inputs.actorUser && inputs.actorUser.id,
        })
        .catch(() => undefined);

      sails.sockets.broadcast(
        `board:${card.boardId}`,
        'cardDelete',
        {
          item: card,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.CARD_DELETE,
        buildData: () => ({
          item: card,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return card;
  },
};
