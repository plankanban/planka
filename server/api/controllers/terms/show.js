/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    type: {
      type: 'string',
      isIn: Object.values(sails.hooks.terms.Types),
      required: true,
    },
    language: {
      type: 'string',
      isIn: User.LANGUAGES,
    },
  },

  async fn(inputs) {
    const terms = await sails.hooks.terms.getPayload(inputs.type, inputs.language);

    return {
      item: terms,
    };
  },
};
