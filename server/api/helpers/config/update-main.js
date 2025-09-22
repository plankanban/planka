/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
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

  async fn(inputs) {
    const { values } = inputs;

    const config = await Config.qm.updateOneMain(values);

    const configRelatedUserIds = await sails.helpers.users.getAllIds(User.Roles.ADMIN);

    configRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'configUpdate',
        {
          item: sails.helpers.config.presentOne(config),
        },
        inputs.request,
      );
    });

    const webhooks = await Webhook.qm.getAll();

    // TODO: with prevData?
    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CONFIG_UPDATE,
      buildData: () => ({
        item: sails.helpers.config.presentOne(config),
      }),
      user: inputs.actorUser,
    });

    return config;
  },
};
