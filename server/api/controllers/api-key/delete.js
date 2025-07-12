/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  DOES_NOT_EXIST: {
    doesNotExist: 'User does not have an API key',
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
    doesNotExist: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { id } = inputs;

    await sails.helpers.apiKey.deleteOne
      .with({
        id,
      })
      .intercept('doesNotExist', () => Errors.DOES_NOT_EXIST)
      .intercept('userNotFound', () => Errors.USER_NOT_FOUND);

    return {
      item: {
        success: true,
      },
    };
  },
};
