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
    await sails.helpers.lists.deleteRelated(inputs.record);

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'listClear',
      {
        item: inputs.record,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.LIST_CLEAR,
      buildData: () => ({
        item: inputs.record,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
        },
      }),
      user: inputs.actorUser,
    });
  },
};
