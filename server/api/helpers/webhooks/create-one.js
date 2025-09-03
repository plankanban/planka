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
    limitReached: {},
  },

  // TODO: use normalizeValues
  async fn(inputs) {
    const { values } = inputs;

    const webhooks = await Webhook.qm.getAll();

    // TODO: move to config?
    if (webhooks.length >= 10) {
      throw 'limitReached';
    }

    if (values.events) {
      values.events = _.intersection(values.events, Object.values(Webhook.Events));
      delete values.excludedEvents;
    } else if (values.excludedEvents) {
      values.excludedEvents = _.intersection(values.excludedEvents, Object.values(Webhook.Events));
      delete values.events;
    }

    const webhook = await Webhook.qm.createOne(values);
    webhooks.push(webhook);

    const scoper = sails.helpers.users.makeScoper(inputs.actorUser);
    const privateUserRelatedUserIds = await scoper.getPrivateUserRelatedUserIds();

    privateUserRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'webhookCreate',
        {
          item: webhook,
        },
        inputs.request,
      );
    });

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.WEBHOOK_CREATE,
      buildData: () => ({
        item: webhook,
      }),
      user: inputs.actorUser,
    });

    return webhook;
  },
};
