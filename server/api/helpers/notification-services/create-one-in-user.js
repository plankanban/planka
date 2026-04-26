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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    appriseDisabled: {},
    schemaNotAllowed: {},
    limitReached: {},
  },

  async fn(inputs) {
    const { values } = inputs;
    const { appriseEnabled, appriseAllowedSchemas, appriseBlockedSchemas } = sails.config.custom;

    if (!appriseEnabled) {
      throw 'appriseDisabled';
    }

    const schema = values.url.split(':')[0];

    if (appriseAllowedSchemas.length > 0 && !appriseAllowedSchemas.includes(schema)) {
      throw 'schemaNotAllowed';
    }

    if (appriseAllowedSchemas.length === 0 && appriseBlockedSchemas.includes(schema)) {
      throw 'schemaNotAllowed';
    }

    const notificationServicesTotal = await sails.helpers.users.getNotificationServicesTotal(
      values.user.id,
    );

    // TODO: move to config?
    if (notificationServicesTotal >= 5) {
      throw 'limitReached';
    }

    const notificationService = await NotificationService.qm.createOne({
      ...values,
      userId: values.user.id,
    });

    sails.sockets.broadcast(
      `user:${notificationService.userId}`,
      'notificationServiceCreate',
      {
        item: notificationService,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.NOTIFICATION_SERVICE_CREATE,
      buildData: () => ({
        item: notificationService,
        included: {
          users: [values.user],
        },
      }),
      user: inputs.actorUser,
    });

    return notificationService;
  },
};
