/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    userNotFound: {},
    doesNotExist: {},
  },

  async fn(inputs) {
    const { id } = inputs;

    const user = await User.findOne({ id });
    if (!user) throw 'userNotFound';
    if (!user.apiKeyHash) throw 'doesNotExist';

    await User.updateOne({ id }).set({
      apiKeyPrefix: null,
      apiKeyHash: null,
    });

    return { success: true };
  },
};
