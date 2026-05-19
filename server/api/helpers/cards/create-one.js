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
    request: {
      type: 'ref',
    },
  },

  exits: {
    positionMustBeInValues: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (values.dueDate) {
      if (_.isNil(values.isDueCompleted)) {
        values.isDueCompleted = false;
      }
    } else {
      delete values.isDueCompleted;
    }

    if (sails.helpers.lists.isFinite(values.list)) {
      if (_.isUndefined(values.position)) {
        throw 'positionMustBeInValues';
      }

      const cards = await Card.qm.getByListId(values.list.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        cards,
      );

      values.position = position;

      if (repositions.length > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const reposition of repositions) {
          // eslint-disable-next-line no-await-in-loop
          await Card.qm.updateOne(
            {
              id: reposition.record.id,
              listId: reposition.record.listId,
            },
            {
              position: reposition.position,
            },
          );

          sails.sockets.broadcast(`board:${values.board.id}`, 'cardUpdate', {
            item: {
              id: reposition.record.id,
              position: reposition.position,
            },
          });

          // TODO: send webhooks
        }
      }
    } else {
      delete values.position;
    }

    if (List.TYPE_STATE_BY_TYPE[values.list.type] === List.TypeStates.CLOSED) {
      values.isClosed = true;
    }

    const card = await Card.qm.createOne({
      ...values,
      boardId: values.board.id,
      listId: values.list.id,
      creatorUserId: values.creatorUser.id,
      listChangedAt: new Date().toISOString(),
    });

    // Mirror to Supabase (best-effort — never blocks).
    supabase
      .upsertCard(card, {
        projectName: inputs.project && inputs.project.name,
        boardName: values.board && values.board.name,
        listName: values.list && values.list.name,
        listType: values.list && values.list.type,
        labels: [],
        customFields: {},
      })
      .catch(() => undefined);
    supabase
      .logEvent({
        cardId: card.id,
        eventType: 'create',
        data: {
          list_id: values.list && String(values.list.id),
          list_name: values.list && values.list.name,
          list_type: values.list && values.list.type,
        },
        userEmail: values.creatorUser && values.creatorUser.email,
        userId: values.creatorUser && values.creatorUser.id,
      })
      .catch(() => undefined);

    sails.sockets.broadcast(
      `board:${card.boardId}`,
      'cardCreate',
      {
        item: card,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CARD_CREATE,
      buildData: () => ({
        item: card,
        included: {
          projects: [inputs.project],
          boards: [values.board],
          lists: [values.list],
        },
      }),
      user: values.creatorUser,
    });

    if (values.creatorUser.subscribeToOwnCards) {
      try {
        await CardSubscription.qm.createOne({
          cardId: card.id,
          userId: card.creatorUserId,
        });
      } catch (error) {
        if (error.code !== 'E_UNIQUE') {
          throw error;
        }
      }

      sails.sockets.broadcast(`user:${card.creatorUserId}`, 'cardUpdate', {
        item: {
          id: card.id,
          isSubscribed: true,
        },
      });

      // TODO: send webhooks
    }

    await sails.helpers.actions.createOne.with({
      webhooks,
      values: {
        card,
        type: Action.Types.CREATE_CARD,
        data: {
          card: _.pick(card, ['name']),
          list: _.pick(values.list, ['id', 'type', 'name']),
        },
        user: values.creatorUser,
      },
      project: inputs.project,
      board: values.board,
      list: values.list,
    });

    if (values.list.labelId) {
      const linkedLabel = await Label.qm.getOneById(values.list.labelId);

      if (linkedLabel) {
        await sails.helpers.cardLabels.createOne.with({
          project: inputs.project,
          board: values.board,
          list: values.list,
          values: { card, label: linkedLabel },
          actorUser: values.creatorUser,
          request: inputs.request,
        });
      }
    }

    // If the card was created directly inside a `closed` list, stamp the
    // "Chamado finalizado em" field right away.
    if (values.list.type === List.Types.CLOSED) {
      await sails.helpers.cards.syncFinalizedAt
        .with({
          card,
          boardId: values.board.id,
          fromType: null,
          toType: values.list.type,
          request: inputs.request,
        })
        .tolerate(() => undefined);
    }

    return card;
  },
};
