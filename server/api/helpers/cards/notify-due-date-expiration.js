/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    webhooks: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    let pathToProject;
    try {
      pathToProject = await sails.helpers.cards.getPathToProjectById(inputs.id);
    } catch (error) {
      return; // Card no longer exists
    }

    const { card, list, board, project } = pathToProject;

    if (
      !card.dueDate ||
      card.isDueCompleted ||
      card.dueDateExpirationNotifiedAt ||
      new Date(card.dueDate).getTime() > Date.now()
    ) {
      return;
    }

    if (sails.helpers.lists.isArchiveOrTrash(list)) {
      return;
    }

    const { webhooks = await Webhook.qm.getAll() } = inputs;

    const { card: updatedCard } = await Card.qm.updateOne(card.id, {
      dueDateExpirationNotifiedAt: new Date().toISOString(),
    });

    if (!updatedCard) {
      return;
    }

    sails.sockets.broadcast(`board:${board.id}`, 'cardUpdate', {
      item: updatedCard,
    });

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CARD_DUE_DATE_EXPIRED,
      buildData: () => ({
        item: updatedCard,
        included: {
          projects: [project],
          boards: [board],
          lists: [list],
        },
      }),
      user: null,
    });
  },
};
