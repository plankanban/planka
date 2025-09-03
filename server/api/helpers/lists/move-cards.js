/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
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
    listInValuesMustBeEndless: {},
    listInValuesMustBelongToBoard: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    // TODO: allow for finite lists?
    if (sails.helpers.lists.isFinite(values.list)) {
      throw 'listInValuesMustBeEndless';
    }

    if (values.list.boardId !== inputs.board.id) {
      throw 'listInValuesMustBelongToBoard';
    }

    if (inputs.record.type === List.Types.TRASH) {
      values.prevListId = null;
    } else if (sails.helpers.lists.isArchiveOrTrash(values.list)) {
      values.prevListId = inputs.record.id;
    } else if (inputs.record.type === List.Types.ARCHIVE) {
      values.prevListId = null;
    }

    const { cards } = await Card.qm.update(
      {
        listId: inputs.record.id,
      },
      {
        ...values,
        listId: values.list.id,
        position: null,
        listChangedAt: new Date().toISOString(),
      },
    );

    const actions = await Action.qm.create(
      cards.map((card) => ({
        cardId: card.id,
        userId: inputs.actorUser.id,
        type: Action.Types.MOVE_CARD,
        data: {
          fromList: _.pick(inputs.record, ['id', 'type', 'name']),
          toList: _.pick(values.list, ['id', 'type', 'name']),
        },
      })),
    );

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'cardsUpdate',
      {
        items: cards,
        included: {
          actions,
        },
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
            lists: [values.list],
          },
        }),
        user: inputs.actorUser,
      });
    });

    // TODO: create notifications

    return { cards, actions };
  },
};
