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
    user: {
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
    const notificationService = await NotificationService.qm.deleteOne(inputs.record.id);

    if (notificationService) {
      sails.sockets.broadcast(
        `user:${notificationService.userId}`,
        'notificationServiceDelete',
        {
          item: notificationService,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.NOTIFICATION_SERVICE_DELETE,
        buildData: () => ({
          item: notificationService,
          included: {
            users: [inputs.user],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return notificationService;
  },
};
