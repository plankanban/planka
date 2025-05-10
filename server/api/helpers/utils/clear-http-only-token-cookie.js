/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  sync: true,

  inputs: {
    response: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    inputs.response.clearCookie('httpOnlyToken', {
      path: sails.config.custom.baseUrlPath,
    });
  },
};
