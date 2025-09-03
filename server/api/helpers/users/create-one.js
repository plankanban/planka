/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const bcrypt = require('bcrypt');

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

  exits: {
    emailAlreadyInUse: {},
    usernameAlreadyInUse: {},
    activeLimitReached: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (values.password) {
      values.password = await bcrypt.hash(values.password, 10);
    }

    if (values.username) {
      values.username = values.username.toLowerCase();
    }

    let user;
    try {
      user = await User.qm.createOne({
        ...values,
        email: values.email.toLowerCase(),
      });
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'emailAlreadyInUse';
      }

      if (
        error.name === 'AdapterError' &&
        error.raw.constraint === 'user_account_username_unique'
      ) {
        throw 'usernameAlreadyInUse';
      }

      if (error.message === 'activeLimitReached') {
        throw 'activeLimitReached';
      }

      throw error;
    }

    const scoper = sails.helpers.users.makeScoper(user);
    const privateUserRelatedUserIds = await scoper.getPrivateUserRelatedUserIds();

    privateUserRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'userCreate',
        {
          // FIXME: hack
          item: sails.helpers.users.presentOne(user, {
            id: userId,
            role: User.Roles.ADMIN,
          }),
        },
        inputs.request,
      );
    });

    const publicUserRelatedUserIds = await scoper.getPublicUserRelatedUserIds(true);

    publicUserRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'userCreate',
        {
          // FIXME: hack
          item: sails.helpers.users.presentOne(user, {
            id: userId,
          }),
        },
        inputs.request,
      );
    });

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.USER_CREATE,
      buildData: () => ({
        item: sails.helpers.users.presentOne(user),
      }),
      user: inputs.actorUser,
    });

    return user;
  },
};
