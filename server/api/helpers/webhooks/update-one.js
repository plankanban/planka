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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  // TODO: use normalizeValues
  async fn(inputs) {
    const { values } = inputs;

    if (values.events) {
      Object.assign(values, {
        events: _.intersection(values.events, Object.values(Webhook.Events)),
        excludedEvents: null,
      });
    } else if (values.excludedEvents) {
      Object.assign(values, {
        events: null,
        excludedEvents: _.intersection(values.excludedEvents, Object.values(Webhook.Events)),
      });
    }

    const webhook = await Webhook.qm.updateOne(inputs.record.id, values);

    if (webhook) {
      const scoper = sails.helpers.users.makeScoper(inputs.actorUser);
      const privateUserRelatedUserIds = await scoper.getPrivateUserRelatedUserIds();

      privateUserRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'webhookUpdate',
          {
            item: webhook,
          },
          inputs.request,
        );
      });

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.WEBHOOK_UPDATE,
        buildData: () => ({
          item: webhook,
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    return webhook;
  },
};
