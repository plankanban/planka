/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { isUrl } = require('../../../utils/validators');

const Errors = {
  LIMIT_REACHED: {
    limitReached: 'Limit reached',
  },
};

module.exports = {
  inputs: {
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
    url: {
      type: 'string',
      maxLength: 2048,
      custom: isUrl,
      required: true,
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
    limitReached: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['name', 'url', 'accessToken']);
    const events = inputs.events && inputs.events.split(',');
    const excludedEvents = inputs.excludedEvents && inputs.excludedEvents.split(',');

    const webhook = await sails.helpers.webhooks.createOne
      .with({
        values: {
          ...values,
          events,
          excludedEvents,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('limitReached', () => Errors.LIMIT_REACHED);

    return {
      item: webhook,
    };
  },
};
