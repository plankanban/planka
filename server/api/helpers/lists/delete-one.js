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
    const trashList = await List.qm.getOneTrashByBoardId(inputs.board.id);

    const { cards } = await Card.qm.update(
      {
        listId: inputs.record.id,
      },
      {
        listId: trashList.id,
        position: null,
        listChangedAt: new Date().toISOString(),
      },
    );

    // TODO: create actions and notifications

    const list = await List.qm.deleteOne(inputs.record.id);

    if (list) {
      sails.sockets.broadcast(
        `board:${list.boardId}`,
        'listDelete',
        {
          item: list,
          included: {
            cards,
          },
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.LIST_DELETE,
        buildData: () => ({
          item: list,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return { list, cards };
  },
};
