/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    limitReached: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    const notificationServicesTotal = await sails.helpers.boards.getNotificationServicesTotal(
      values.board.id,
    );

    // TODO: move to config?
    if (notificationServicesTotal >= 5) {
      throw 'limitReached';
    }

    const notificationService = await NotificationService.qm.createOne({
      ...values,
      boardId: values.board.id,
    });

    const scoper = sails.helpers.projects.makeScoper.with({
      notificationService,
      record: inputs.project,
      board: values.board,
    });

    const notificationServiceRelatedUserIds = await scoper.getNotificationServiceRelatedUserIds();

    notificationServiceRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'notificationServiceCreate',
        {
          item: notificationService,
        },
        inputs.request,
      );
    });

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.NOTIFICATION_SERVICE_CREATE,
      buildData: () => ({
        item: notificationService,
        included: {
          projects: [inputs.project],
          boards: [values.board],
        },
      }),
      user: inputs.actorUser,
    });

    return notificationService;
  },
};
