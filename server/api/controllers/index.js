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
    // This view is the client's entry point, and it names the content-hashed
    // bundles of the build it was rendered from. A copy held over from the
    // previous release asks for bundles that are no longer there, which is the
    // blank page with nothing in the log that gets reported after an upgrade.
    // It is served from views/, not public/, so the static middleware's cache
    // rules in config/http.js never get a say over it — hence the same terms
    // repeated here, for the files it serves that carry no hash.
    this.res.set('Cache-Control', 'public, max-age=0, must-revalidate');

    return {
      basePath: sails.config.custom.baseUrlPath,
    };
  },
};
