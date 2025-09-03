/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  WEBHOOK_NOT_FOUND: {
    webhookNotFound: 'Webhook not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    webhookNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let webhook = await Webhook.qm.getOneById(inputs.id);

    if (!webhook) {
      throw Errors.WEBHOOK_NOT_FOUND;
    }

    webhook = await sails.helpers.webhooks.deleteOne.with({
      record: webhook,
      actorUser: currentUser,
      request: this.req,
    });

    if (!webhook) {
      throw Errors.WEBHOOK_NOT_FOUND;
    }

    return {
      item: webhook,
    };
  },
};
