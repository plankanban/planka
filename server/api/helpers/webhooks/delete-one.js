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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const webhooks = await Webhook.qm.getAll();

    const webhook = await Webhook.qm.deleteOne(inputs.record.id);

    if (webhook) {
      const scoper = sails.helpers.users.makeScoper(inputs.actorUser);
      const privateUserRelatedUserIds = await scoper.getPrivateUserRelatedUserIds();

      privateUserRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'webhookDelete',
          {
            item: webhook,
          },
          inputs.request,
        );
      });

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.WEBHOOK_DELETE,
        buildData: () => ({
          item: webhook,
        }),
        user: inputs.actorUser,
      });
    }

    return webhook;
  },
};
