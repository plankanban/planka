/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  exits: {
    success: {
      responseType: 'view',
      viewTemplatePath: 'index',
    },
  },

  fn() {
    return this.res.view('index', {
      baseUrlPath: sails.config.custom.baseUrlPath,
    });
  },
};
