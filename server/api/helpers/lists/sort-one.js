/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { POSITION_GAP } = require('../../../constants');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    options: {
      type: 'json',
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

  exits: {
    cannotBeSortedAsEndlessList: {},
    invalidFieldName: {},
  },

  async fn(inputs) {
    const { options } = inputs;

    if (!sails.helpers.lists.isFinite(inputs.record)) {
      throw 'cannotBeSortedAsEndlessList';
    }

    let cards = await Card.qm.getByListId(inputs.record.id);

    switch (options.fieldName) {
      case List.SortFieldNames.NAME:
        cards.sort((card1, card2) => card1.name.localeCompare(card2.name));

        break;
      case List.SortFieldNames.DUE_DATE:
        cards.sort((card1, card2) => {
          if (card1.dueDate === null) {
            return 1;
          }

          if (card2.dueDate === null) {
            return -1;
          }

          return new Date(card1.dueDate) - new Date(card2.dueDate);
        });

        break;
      case List.SortFieldNames.CREATED_AT:
        cards.sort((card1, card2) => new Date(card1.createdAt) - new Date(card2.createdAt));

        break;
      default:
        throw 'invalidFieldName';
    }

    if (options.order === List.SortOrders.DESC) {
      cards.reverse();
    }

    cards = await Promise.all(
      cards.map((card, index) =>
        Card.qm.updateOne(
          {
            id: card.id,
            listId: card.listId,
          },
          {
            position: POSITION_GAP * (index + 1),
          },
        ),
      ),
    );

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'cardsUpdate',
      {
        items: cards,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    cards.forEach((card) => {
      // TODO: with prevData?
      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.CARD_UPDATE,
        buildData: () => ({
          item: card,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.record],
          },
        }),
        user: inputs.actorUser,
      });
    });

    return cards;
  },
};
