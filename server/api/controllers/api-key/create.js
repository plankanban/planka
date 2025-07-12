/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  ALREADY_EXISTS: {
    alreadyExists: 'API key already exists',
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
    userNotFound: {
      responseType: 'notFound',
    },
    alreadyExists: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { id } = inputs;

    const { apiKey } = await sails.helpers.apiKey.createAndStore
      .with({
        id,
        cycle: false,
      })
      .intercept('alreadyExists', () => Errors.ALREADY_EXISTS)
      .intercept('userNotFound', () => Errors.USER_NOT_FOUND);

    return {
      item: {
        apiKey,
      },
    };
  },
};
