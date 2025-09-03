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
    board: {
      type: 'ref',
      required: true,
    },
    project: {
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
    const { values } = inputs;

    const notificationService = await NotificationService.qm.updateOne(inputs.record.id, values);

    if (notificationService) {
      const scoper = sails.helpers.projects.makeScoper.with({
        notificationService,
        record: inputs.project,
        board: inputs.board,
      });

      const notificationServiceRelatedUserIds = await scoper.getNotificationServiceRelatedUserIds();

      notificationServiceRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'notificationServiceUpdate',
          {
            item: notificationService,
          },
          inputs.request,
        );
      });

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.NOTIFICATION_SERVICE_UPDATE,
        buildData: () => ({
          item: notificationService,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    return notificationService;
  },
};
