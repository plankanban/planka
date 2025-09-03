/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { isUrl } = require('../../../utils/validators');
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
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    url: {
      type: 'string',
      maxLength: 2048,
      custom: isUrl,
    },
    accessToken: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 512,
      allowNull: true,
    },
    events: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 2048,
      allowNull: true,
    },
    excludedEvents: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 2048,
      allowNull: true,
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

    const values = _.pick(inputs, ['name', 'url', 'accessToken']);
    const events = inputs.events && inputs.events.split(',');
    const excludedEvents = inputs.excludedEvents && inputs.excludedEvents.split(',');

    webhook = await sails.helpers.webhooks.updateOne.with({
      record: webhook,
      values: {
        ...values,
        events,
        excludedEvents,
      },
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
